import { checkFiles, generateIgnore } from '../src/enforcer'

import * as core from '@actions/core'
import ignore, { Ignore } from 'ignore'

jest.mock('@actions/core')

beforeAll(() => {
  jest.spyOn(core, 'getInput').mockImplementation((name, options) => {
    return jest.requireActual('@actions/core').getInput(name, options)
  })
})

const codeOwners: Ignore = ignore()

codeOwners.add('foo.txt')

describe('generateIgnored', () => {
  it('returns an empty array when all files have a code owner', async () => {
    const ignored: Ignore = ignore()
    generateIgnore(ignored, `${__dirname}/fixtures/CODEOWNERS`)

    expect(ignored.ignores('foo.txt')).toBeTruthy()
    expect(ignored.ignores('bar.txt')).toBeFalsy()
  })
})

describe('checkFiles', () => {
  it('returns an empty array when all files have a code owner', async () => {
    const changedFiles = ['foo.txt', 'bar.txt']
    const result = await checkFiles(codeOwners, changedFiles)

    expect(result).toEqual(['bar.txt'])
  })
})
