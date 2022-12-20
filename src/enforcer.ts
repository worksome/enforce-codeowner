import { existsSync, readFileSync, createReadStream } from 'fs'
import * as core from '@actions/core'
import * as github from '@actions/github'
import ignore, { Ignore } from 'ignore'
import * as readline from 'readline'

type ClientType = ReturnType<typeof github.getOctokit>

export async function run(): Promise<void> {
  try {
    const token: string = core.getInput('token', { required: true })
    const codeOwnersPath: string =
      core.getInput('codeOwnersPath') || '.github/CODEOWNERS'
    const commentPrefix: string = core.getInput('commentPrefix') || ''
    const commentSuffix: string = core.getInput('commentSuffix') || ''
    const checkboxes: boolean = core.getBooleanInput('checkboxes') || false
    const includeDeleted: boolean =
      core.getBooleanInput('includeDeleted') || false

    const ignoredFiles: string[] = await getIgnoredFiles(
      core.getInput('ignoredFiles') || ''
    )

    const prNumber = getPrNumber()
    if (!prNumber) {
      console.log('Could not get pull request number from context, exiting')
      return
    }

    const client: ClientType = github.getOctokit(token)

    core.debug(`fetching changed files for pr #${prNumber}`)
    const changedFiles: string[] = await getChangedFiles(
      client,
      prNumber,
      includeDeleted
    )

    const ignored = ignore()

    generateIgnore(ignored, codeOwnersPath)

    ignoredFiles.forEach((ignoredFile: string) => ignored.add(ignoredFile))

    const result = await checkFiles(ignored, changedFiles)

    if (result.length !== 0) {
      await postComment(result, checkboxes, commentPrefix, commentSuffix)
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

export function generateIgnore(ig: Ignore, codeOwnerPath: string): void {
  if (!existsSync(codeOwnerPath)) {
    throw new Error(`CODEOWNERS file ${codeOwnerPath} not exist.`)
  }

  const rawCodeOwners = readFileSync(codeOwnerPath).toString()

  rawCodeOwners.split(/\r?\n/).map((line) => {
    const trimmedLine = line.trim()

    if (trimmedLine === '' || trimmedLine.startsWith('#')) {
      return
    }

    ig.add(trimmedLine.split(/\s+/)[0])
  })
}

async function getChangedFiles(
  client: ClientType,
  prNumber: number,
  includeDeleted: boolean
): Promise<string[]> {
  const listFilesOptions = client.rest.pulls.listFiles.endpoint.merge({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: prNumber,
  })

  const listFilesResponse: any[] = await client.paginate(listFilesOptions)
  const changedFiles: string[] = listFilesResponse
    .filter((f: any) => includeDeleted || f.status !== 'deleted')
    .map((f: any) => f.filename)

  if (changedFiles.length > 0) {
    core.debug('Found changed files:')
    for (const file of changedFiles) {
      core.debug(`  ${file}`)
    }
  } else {
    core.debug('No changed files were found.')
  }

  return changedFiles
}

export async function getIgnoredFiles(
  ignoredLinesList: string
): Promise<string[]> {
  const ignoredFiles: string[] = ignoredLinesList
    .split('\n')
    .filter((ignoredFile: string) => ignoredFile.trim().length > 0)

  if (ignoredFiles.length > 0) {
    core.debug('Ignoring files:')
    for (const file of ignoredFiles) {
      core.debug(`  ${file}`)
    }
  } else {
    core.debug('No ignored files were found.')
  }

  return ignoredFiles
}

export async function checkFiles(
  ig: Ignore,
  changedFiles: string[]
): Promise<string[]> {
  const failedList: string[] = []

  changedFiles.forEach((file: string) => {
    core.debug(`Checking file ${file}`)

    if (!ig.ignores(file)) {
      core.error(`${file} does not have a codeowner.`, {
        file,
      })

      failedList.push(file)
    }
  })

  return failedList
}

export async function postComment(
  files: string[],
  checkboxes: boolean,
  commentPrefix: string,
  commentSuffix: string
): Promise<void> {
  if (files.length === 0) {
    return
  }

  const message: string[] = []

  if (commentPrefix !== '') {
    message.push(commentPrefix)
  }

  const linePrefix: string = checkboxes ? '- [ ]' : '-'
  message.push(...files.map((file: string) => `${linePrefix} \`${file}\``))

  if (commentSuffix !== '') {
    message.push(`\n${commentSuffix}`)
  }

  const body = message.join('\n')

  core.setOutput('comment', body)
}

function getPrNumber(): number | undefined {
  const pullRequest = github.context.payload.pull_request
  if (!pullRequest) {
    return undefined
  }

  return pullRequest.number
}
