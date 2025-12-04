
import { sendResponse } from "../../utils/sendResponse.js";

describe('sendResponse Function', () => {
  // Mock sendResponse from utils/sendResponse.js
  // function sendResponse(res, success, message, data = null) {
  //   res.json({ success, message, data });
  // }

  describe('Response Structure', () => {
    test('calls res.json with correct structure for success', () => {
      const mockRes = {
        json: jest.fn()
      };

      sendResponse(mockRes, true, 'Operation successful', { id: 1 });

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Operation successful',
        data: { id: 1 }
      });
    });

    test('calls res.json with correct structure for error', () => {
      const mockRes = {
        json: jest.fn()
      };

      sendResponse(mockRes, false, 'Error occurred');

      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error occurred',
        data: null
      });
    });

    test('uses null as default data value', () => {
      const mockRes = {
        json: jest.fn()
      };

      sendResponse(mockRes, true, 'Success');

      const calledWith = mockRes.json.mock.calls[0][0];
      expect(calledWith.data).toBeNull();
    });

    test('includes all required fields', () => {
      const mockRes = {
        json: jest.fn()
      };

      sendResponse(mockRes, true, 'Test', { test: 'value' });

      const calledWith = mockRes.json.mock.calls[0][0];
      expect(calledWith).toHaveProperty('success');
      expect(calledWith).toHaveProperty('message');
      expect(calledWith).toHaveProperty('data');
    });

    test('success field is boolean', () => {
      const mockRes = {
        json: jest.fn()
      };

      sendResponse(mockRes, true, 'Test');

      const calledWith = mockRes.json.mock.calls[0][0];
      expect(typeof calledWith.success).toBe('boolean');
    });

    test('message field is string', () => {
      const mockRes = {
        json: jest.fn()
      };

      sendResponse(mockRes, true, 'Test message');

      const calledWith = mockRes.json.mock.calls[0][0];
      expect(typeof calledWith.message).toBe('string');
      expect(calledWith.message).toBe('Test message');
    });
  });
});