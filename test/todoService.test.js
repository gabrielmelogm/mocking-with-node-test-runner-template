import assert from "node:assert"
import crypto from "node:crypto"
import { describe, it, before, beforeEach, after, afterEach} from 'node:test'

import sinon from "sinon"

import Todo from "../src/todo.js"
import TodoService from "../src/todoService.js"

describe('todoService test Suite', () => {
  describe('#list', () => {
    let _todoService
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
        todoRepository: {
          list: context.mock.fn(async () => mockDatabase)
        }
      }
      _todoService = new TodoService(_dependencies)
    })
    it('should return a list of items with uppercase text', async () => {
      const expected = mockDatabase.map(({ text, ...result }) => (new Todo({ text: text.toUpperCase(), ...result })))
      const result = await _todoService.list()
      assert.deepStrictEqual(result, expected)

      const fnMock = _dependencies.todoRepository.list.mock
      assert.strictEqual(fnMock.callCount(), 1)
    })
  })
  describe('#create', () => {
    let _todoService
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
        todoRepository: {
          create: context.mock.fn(async () => mockCreateResult)
        }
      }
      _todoService = new TodoService(_dependencies)
    })

    it("shouldn't save todo item with invalid data", async () => {
      const input = new Todo({
        text: '',
        when: ''
      })
      const expected = {
        error: {
          message: 'invalid data',
          data: {
            text: '',
            when: '',
            status: '',
            id: DEFAULT_ID
          }
        }
      }

      const result = await _todoService.create(input)
      assert.deepStrictEqual(JSON.stringify(result), JSON.stringify(expected))
    })

    it("shouldn't save todo item with pending status when the property is further than today", async () => {
      const properties = {
        text: 'I must plan my trip to Europe',
        when: new Date('2020-12-02 12:00:00 GMT-0')
      }

      const expected = {
        ...properties,
        status: 'pending',
        id: DEFAULT_ID
      }

      const input = new Todo(properties)
      const today = new Date('2020-12-01')
      _sandBox.useFakeTimers(today.getTime())

      await _todoService.create(input)

      const fnMock = _dependencies.todoRepository.create.mock
      assert.strictEqual(fnMock.callCount(), 1)
      assert.deepStrictEqual(fnMock.calls[0].arguments[0], expected)
    })
    
    it("shouldn't save todo item with late status when the property is further than today", async () => {
      const properties = {
        text: 'I must plan my trip to Europe',
        when: new Date('2020-12-01 12:00:00 GMT-0')
      }

      const expected = {
        ...properties,
        status: 'late',
        id: DEFAULT_ID
      }

      const input = new Todo(properties)
      const today = new Date('2020-12-02')
      _sandBox.useFakeTimers(today.getTime())

      await _todoService.create(input)

      const fnMock = _dependencies.todoRepository.create.mock
      assert.strictEqual(fnMock.callCount(), 1)
      assert.deepStrictEqual(fnMock.calls[0].arguments[0], expected)
    })

  })
})