// eslint-disable-next-line max-params
export const error = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err)
  }

  return res.status(err?.statusCode || 500).json({ message: err?.message || 'INTERNAL_SERVER_ERROR' })
}
