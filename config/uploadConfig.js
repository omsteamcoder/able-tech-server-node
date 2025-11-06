export const uploadConfigs = {
  slider: {
    folderName: "slider",
    sizes: [{ fieldName: "img", width: 600, height: 400 }],
    uploadType: "single",
  },
  clientLogo: {
    folderName: "client-logo",
    sizes: [{ fieldName: "img", width: 404, height: 136 }],
    uploadType: "single",
  },
  gallery: {
    folderName: "gallery",
    sizes: [{ fieldName: "img", width: 533, height: 300 }],
    uploadType: "single",
  },
  sectionOne: {
    folderName: "section-one",
    sizes: [{ fieldName: "img", width: 960, height: 600 }],
    uploadType: "single",
  },
  page: {
    folderName: "pages",
    sizes: [
      { fieldName: "thumbnail", width: 533, height: 300, single: true },
      {
        fieldName: "images",
        width: 533,
        height: 300,
        multiple: true,
        limit: 10,
      },
      // ADD THESE NEW FIELDS
      { 
        fieldName: "backgroundImage", 
        width: 1920, 
        height: 1080, 
        single: true 
      },
      {
        fieldName: "sectionBackgroundImages",
        width: 1920,
        height: 1080,
        multiple: true,
        limit: 10,
      },
    ],
  },
  product: {
    folderName: "products",
    sizes: [
      { fieldName: "mainImage", width: 800, height: 600, single: true },
      {
        fieldName: "galleryImages",
        width: 600,
        height: 400,
        multiple: true,
        limit: 10,
      },
      {
        fieldName: "diagramImages",
        width: 800,
        height: 600,
        multiple: true,
        limit: 5,
      },
    ],
  },
  blog: {
    folderName: "blogs",
    sizes: [
      { fieldName: "thumbnail", width: 400, height: 300, single: true },
      { fieldName: "coverImage", width: 1200, height: 600, single: true },
      {
        fieldName: "contentImages",
        width: 800,
        height: 600,
        multiple: true,
        limit: 20,
      },
    ],
  },
};