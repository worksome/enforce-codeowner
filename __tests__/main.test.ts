import { run } from '../src/enforcer'
import * as github from '@actions/github'
import * as core from '@actions/core'

jest.mock('@actions/core')
jest.mock('@actions/github')

const gh = github.getOctokit('_')
const createCommentMock = jest.spyOn(gh.rest.issues, 'createComment')
const paginateMock = jest.spyOn(gh, 'paginate')

afterAll(() => jest.restoreAllMocks())

const mockInput = {
  token: '_',
  codeOwnersPath: '',
  commentPrefix: '',
  commentSuffix: '',
}

jest
  .spyOn(core, 'getInput')
  .mockImplementation((name: string, ...opts) => mockInput[name])

beforeEach(() => {
  mockInput.token = '_'
  mockInput.codeOwnersPath = `${__dirname}/fixtures/CODEOWNERS`
  mockInput.commentPrefix = ''
  mockInput.commentSuffix = ''
})

describe('run', () => {
  it('adds a comment with prefix when changed files do not have a code owner', async () => {
    mockGitHubResponseChangedFiles('bar.txt')

    mockInput.commentPrefix = 'The following files do not have code owners:'

    await run()

    expect(createCommentMock).toHaveBeenCalledTimes(1)
    expect(createCommentMock).toHaveBeenCalledWith({
      owner: 'worksome',
      repo: 'enforce-codeowner',
      issue_number: 123,
      body: 'The following files do not have code owners:\n- bar.txt',
    })
  })

  it('adds a comment with suffix when changed files do not have a code owner', async () => {
    mockGitHubResponseChangedFiles('bar.txt')

    mockInput.commentSuffix = 'The above files do not have code owners...'

    await run()

    expect(createCommentMock).toHaveBeenCalledTimes(1)
    expect(createCommentMock).toHaveBeenCalledWith({
      owner: 'worksome',
      repo: 'enforce-codeowner',
      issue_number: 123,
      body: '- bar.txt\nThe above files do not have code owners...',
    })
  })

  it('adds a comment with prefix and suffix when changed files do not have a code owner', async () => {
    mockGitHubResponseChangedFiles('bar.txt')

    mockInput.commentPrefix = 'The following files do not have code owners:'
    mockInput.commentSuffix = 'Wow!'

    await run()

    expect(createCommentMock).toHaveBeenCalledTimes(1)
    expect(createCommentMock).toHaveBeenCalledWith({
      owner: 'worksome',
      repo: 'enforce-codeowner',
      issue_number: 123,
      body: 'The following files do not have code owners:\n- bar.txt\nWow!',
    })
  })

  it('does not a comment when all changed files have a code owner', async () => {
    mockGitHubResponseChangedFiles('foo.txt')

    await run()

    expect(createCommentMock).not.toHaveBeenCalled()
  })
})

function mockGitHubResponseChangedFiles(...files: string[]): void {
  const returnValue = files.map((f) => ({ filename: f }))
  paginateMock.mockReturnValue(<any>returnValue)
}
