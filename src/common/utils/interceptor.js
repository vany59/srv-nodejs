module.exports = (data, req, res, next) => {
  if (data.name && data.name === "Error") {
    res.json({
      data: null,
      message: data.message,
      code: 500,
    });
    return;
  }
  res.json({
    ...data,
    code: data.code || 200,
    message: data.message || "",
  });
};
