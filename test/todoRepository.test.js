import assert from "node:assert"
import { describe, it, beforeEach, before, after, afterEach } from "node:test"
import crypto from "node:crypto"

import sinon from "sinon"

import TodoRepository from "../src/todoRepository.js"
import Todo from "../src/todo.js"

describe('todoRepository test Suite', () => {
  describe('#list', () => {
    let _todoRepository
    let _dependencies

    const mockDatabase = [
      {
        text: 'I MUST PLAN MY TRIP TO EUROPE',
        when: new Date("2021-03-22T00:00:00.000Z"),
        status: 'late',
        id: '5d7f0b36-0cf8-43f4-9672-10c07da8b2ed'
      }
    ]
    beforeEach((context) => {
      _dependencies = {
        db: {
          addCollection: context.mock.fn(() => {
            return {
              find: context.mock.fn(() => mockDatabase)
            }
          })
        }
      }
      _todoRepository = new TodoRepository(_dependencies)
    })
    it('should return a data', async () => {
        const expected = [
          new Todo({
            text: 'I MUST PLAN MY TRIP TO EUROPE',
            when: new Date("2021-03-22T00:00:00.000Z"),
            status: 'late',
            id: '5d7f0b36-0cf8-43f4-9672-10c07da8b2ed'
          })
        ]

        const result = await _todoRepository.list()
        assert.deepStrictEqual(JSON.stringify(result), JSON.stringify(expected))
    })
  })

  describe('#create', () => {
    let _todoRepository
    let _dependencies
    let _sandBox

    const mockCreateResult = {
      text: 'I must plan my trip to Europe',
      when: new Date("2021-03-22T00:00:00.000Z"),
      status: 'late',
      id: '5d7f0b36-0cf8-43f4-9672-10c07da8b2ed'
    }
  
    const DEFAULT_ID = mockCreateResult.id
    before(() => {
      crypto.randomUUID = () => DEFAULT_ID
      _sandBox = sinon.createSandbox()
    })
    after(async () => {
      crypto.randomUUID = (await import ('node:crypto')).randomUUID
    })
    afterEach(() => _sandBox.restore())
    beforeEach((context) => {
      _dependencies = {
        db: {
          addCollection: context.mock.fn(() => {
            return {
              insertOne: context.mock.fn(() => mockCreateResult)
            }
          })
        }
      }
      _todoRepository = new TodoRepository(_dependencies)
    })

    it("shouldn't create a invalid data", async () => {
      const input = new Todo({
        text: 'I must plan my trip to Europe',
        when: new Date('2021-03-22T00:00:00.000Z'),
        status: 'late',
        id: DEFAULT_ID
      })

      const result = await _todoRepository.create(input)

      assert.deepStrictEqual(JSON.stringify(result), JSON.stringify(input))
    })
  })
})