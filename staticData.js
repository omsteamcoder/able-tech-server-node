// Static data for various sections of the Able Tech Engineering website

export const bannerData = {
    title: "Welcome to Able Tech Engineering",
    description: "Innovative solutions for industrial equipment and engineering needs.",
    image: "https://example.com/able-tech-banner.jpg",
    buttonText: "Explore Now",
    buttonLink: "https://example.com/products"
  };
  
  export const productSectionData = [
    {
      product: "6345c7e5e4b05d8f0d7c18b3" // ObjectId reference to a product in the Product collection
    },
    {
      product: "6345c7e5e4b05d8f0d7c18b4" // Another product reference
    }
  ];
  
  export const singleSectionData = {
    image: "https://example.com/able-tech-about.jpg",
    title: "About Our Services",
    description: "Able Tech Engineering provides top-notch industrial equipment and engineering solutions tailored to your business needs."
  };
  
  export const feedbackData = [
    {
      name: "John Doe",
      comment: "Professional services with high-quality products. Exceptional experience with Able Tech Engineering.",
      image: "https://example.com/john-doe-feedback.jpg"
    },
    {
      name: "Jane Smith",
      comment: "Great support team and durable equipment. A reliable partner in our industrial projects.",
      image: "https://example.com/jane-smith-feedback.jpg"
    }
  ];
  
  export const adminProductHighlightData = [
    {
      product: "6345c7e5e4b05d8f0d7c18b3" // ObjectId reference to a highlighted product in the Product collection
    }
  ];
  
  // Example Product Data for Able Tech Engineering
  export const productData = [
    {
      _id: "6345c7e5e4b05d8f0d7c18b3",
      title: "Industrial Conveyor System",
      thumbnailImage: "https://example.com/conveyor-thumbnail.jpg",
      images: [
        "https://example.com/conveyor-image1.jpg",
        "https://example.com/conveyor-image2.jpg"
      ],
      slug: "industrial-conveyor-system",
      category: "6345c7e5e4b05d8f0d7c18c1", // ObjectId reference to the category
      description: "Efficient industrial conveyor system for streamlined manufacturing processes.",
      seoTitle: "Buy Industrial Conveyor System",
      seoDescription: "Explore our range of industrial conveyor systems designed for high efficiency.",
      seoKeywords: ["conveyor system", "industrial equipment", "engineering solutions"]
    },
    {
      _id: "6345c7e5e4b05d8f0d7c18b4",
      title: "Hydraulic Press Machine",
      thumbnailImage: "https://example.com/hydraulic-press-thumbnail.jpg",
      images: [
        "https://example.com/hydraulic-press-image1.jpg",
        "https://example.com/hydraulic-press-image2.jpg"
      ],
      slug: "hydraulic-press-machine",
      category: "6345c7e5e4b05d8f0d7c18c2", // ObjectId reference to the category
      description: "High-performance hydraulic press machines for heavy-duty applications.",
      seoTitle: "Buy Hydraulic Press Machine",
      seoDescription: "Durable and efficient hydraulic press machines for industrial applications.",
      seoKeywords: ["hydraulic press", "industrial press", "engineering equipment"]
    }
  ];
  
  // Example Category Data for Able Tech Engineering
  export const categoryData = [
    {
      _id: "6345c7e5e4b05d8f0d7c18c1",
      name: "Industrial Equipment",
      slug: "industrial-equipment"
    },
    {
      _id: "6345c7e5e4b05d8f0d7c18c2",
      name: "Engineering Tools",
      slug: "engineering-tools"
    }
  ];
  
  export const sectionOneData = [
  {
    title: "Cutting-Edge Engineering",
    subtitle: "Innovating Industrial Solutions",
    description:
      "We specialize in providing state-of-the-art industrial equipment designed to improve efficiency and reduce costs.",
    img: "section-one/innovation.webp",
  },
  {
    title: "Trusted by Global Clients",
    subtitle: "Proven Track Record",
    description:
      "Able Tech Engineering has served industries worldwide with reliable and durable engineering solutions.",
    img: "section-one/global-clients.webp",
  },
];
