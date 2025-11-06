// middleware/debugMiddleware.js
export const debugFormData = (req, res, next) => {
  console.log("=== FORM DATA DEBUG ===");
  console.log("Body:", req.body);
  console.log("Files:", Object.keys(req.files || {}));

  if (req.body.layout) {
    console.log("Layout data:", typeof req.body.layout, req.body.layout);
  }

  if (req.body.meta) {
    console.log("Meta data:", typeof req.body.meta, req.body.meta);
  }

  console.log("=======================");
  next();
};
