 function success(res, data, statusCode) { return res.status(statusCode || 200).json({ success: true, data: data }) }
 function error(res, message, statusCode, errorCode) { return res.status(statusCode || 400).json({ success: false, error: { code: errorCode || 'ERROR', message: message } }) }
 module.exports = { success: success, error: error }
