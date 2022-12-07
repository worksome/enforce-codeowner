export const context = {
  payload: {
    pull_request: {
      number: 123,
    },
  },
  repo: {
    owner: 'worksome',
    repo: 'enforce-codeowner',
  },
}

const mockApi = {
  rest: {
    issues: {
      createComment: jest.fn(),
    },
    pulls: {
      get: jest.fn().mockResolvedValue({}),
      listFiles: {
        endpoint: {
          merge: jest.fn().mockReturnValue({}),
        },
      },
    },
  },
  paginate: jest.fn(),
}

export const getOctokit = jest.fn().mockImplementation(() => mockApi)
