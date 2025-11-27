/* ======================
   HELPER FUNCTIONS
====================== */

export function sendResponse(res, success, message, data = null) {
  res.json({ success, message, data });
}
