import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "/tmp";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,

 limits: {
  fileSize: 4 * 1024 * 1024,
},

  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files allowed"));
    }
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};

function runMiddleware(req: any, res: any, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    await runMiddleware(req, res, upload.single("pdf"));

    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
      });
    }

    return res.status(200).json({
      message: "Upload successful",
      filename: req.file.filename,
    });

  } catch (err: any) {
    return res.status(500).json({
      error: err.message,
    });
  }
}