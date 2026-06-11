const {
  CaseStudy,
  Category,
  CaseStudyDownload,
  WhitePaper,
  WhitePaperCategory,
  WhitePaperDownload,
  Blog,
  BlogTab,
  BlogTabBullet,
  BlogReference,
  BlogDownload,
} = require("../models");
const { generatePublicToken } = require("../utils/publicToken");

exports.getPublicToken = (req, res) => {
  try {
    const token = generatePublicToken();

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "Token generated",
      token,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message,
    });
  }
};

exports.getPublicCaseStudies = async (req, res) => {
  try {
    const data = await CaseStudy.findAll({
      where: {
        is_delete: false,
        is_active: true,
      },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
      attributes: ["id", "title", "description", "pdf_file", "image"],
      order: [["id", "DESC"]],
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const finalData = data.map((item) => {
      const obj = item.toJSON();

      obj.pdf_url = `${baseUrl}/uploads/case-study/pdf/${obj.pdf_file}`;
      obj.image_url = obj.image
        ? `${baseUrl}/uploads/case-study/image/${obj.image}`
        : null;

      return obj;
    });

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "Case studies fetched",
      data: finalData,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message,
    });
  }
};

exports.downloadCaseStudy = async (req, res) => {
  try {
    const { case_study_id, email, mobile, ip_address } = req.body;

    if (!case_study_id || !email || !mobile) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: "Required fields missing",
      });
    }

    const caseStudy = await CaseStudy.findOne({
      where: {
        id: case_study_id,
        is_delete: false,
        is_active: true,
      },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["name"],
        },
      ],
    });

    if (!caseStudy) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: "Case study not found",
      });
    }

    await CaseStudyDownload.create({
      email,
      mobile,
      case_study_id,
      title: caseStudy.title,
      category_name: caseStudy.category?.name || null,
      ip_address,
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const fileUrl = `${baseUrl}/uploads/case-study/pdf/${caseStudy.pdf_file}`;

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "Download ready",
      url: fileUrl,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message,
    });
  }
};

exports.getPublicWhitePaper = async (req, res) => {
  try {
    const data = await WhitePaper.findAll({
      where: {
        is_delete: false,
        is_active: true,
      },
      include: [
        {
          model: WhitePaperCategory,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
      attributes: ["id", "title", "description", "pdf_file", "image"],
      order: [["id", "DESC"]],
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const finalData = data.map((item) => {
      const obj = item.toJSON();

      obj.pdf_url = `${baseUrl}/uploads/white-paper/pdf/${obj.pdf_file}`;
      obj.image_url = obj.image
        ? `${baseUrl}/uploads/white-paper/image/${obj.image}`
        : null;

      return obj;
    });

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "White papers fetched",
      data: finalData,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message,
    });
  }
};

exports.downloadWhitePaper = async (req, res) => {
  try {
    const { white_paper_id, email, mobile, ip_address } = req.body;

    if (!white_paper_id || !email || !mobile) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: "Required fields missing",
      });
    }

    const whitePaper = await WhitePaper.findOne({
      where: {
        id: white_paper_id,
        is_delete: false,
        is_active: true,
      },
      include: [
        {
          model: WhitePaperCategory,
          as: "category",
          attributes: ["name"],
        },
      ],
    });

    if (!whitePaper) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: "White paper not found",
      });
    }

    await WhitePaperDownload.create({
      email,
      mobile,
      white_paper_id,
      title: whitePaper.title,
      category_name: whitePaper.category?.name || null,
      ip_address,
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const fileUrl = `${baseUrl}/uploads/white-paper/pdf/${whitePaper.pdf_file}`;

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "Download ready",
      url: fileUrl,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message,
    });
  }
};

exports.getPublicBlogs = async (req, res) => {
  try {
    const { id } = req.query;

    if (id) {
      const blog = await Blog.findOne({
        where: { id, is_delete: false, is_active: true },
        include: [
          {
            model: BlogTab,
            as: "tabs",
            include: [
              {
                model: BlogTabBullet,
                as: "bullets",
                order: [["bullet_order", "ASC"]],
              },
            ],
          },
          { model: BlogReference, as: "references" },
        ],
        order: [
          [{ model: BlogTab, as: "tabs" }, "tab_order", "ASC"],
          [{ model: BlogReference, as: "references" }, "reference_order", "ASC"],
        ],
      });

      if (!blog) {
        return res.status(404).json({
          status: false,
          responseCode: 404,
          message: "Blog not found",
        });
      }

      return res.status(200).json({
        status: true,
        responseCode: 200,
        message: "Blog fetched",
        data: blog,
      });
    }

    const data = await Blog.findAll({
      where: { is_delete: false, is_active: true },
      include: [
        {
          model: BlogTab,
          as: "tabs",
          include: [
            {
              model: BlogTabBullet,
              as: "bullets",
              order: [["bullet_order", "ASC"]],
            },
          ],
        },
        { model: BlogReference, as: "references" },
      ],
      order: [
        ["id", "DESC"],
        [{ model: BlogTab, as: "tabs" }, "tab_order", "ASC"],
        [{ model: BlogReference, as: "references" }, "reference_order", "ASC"],
      ],
    });

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "Blogs fetched",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message,
    });
  }
};

exports.downloadBlog = async (req, res) => {
  try {
    const { blog_id, email, mobile, ip_address } = req.body;

    if (!blog_id || !email || !mobile) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: "Required fields missing",
      });
    }

    const blog = await Blog.findOne({
      where: {
        id: blog_id,
        is_delete: false,
        is_active: true,
      },
    });

    if (!blog) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: "Blog not found",
      });
    }

    await BlogDownload.create({
      email,
      mobile,
      blog_id,
      title: blog.main_title,
      ip_address,
    });

    if (!blog.pdf_file) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: "No downloadable PDF for this blog",
      });
    }

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "Download ready",
      url: blog.pdf_file,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message,
    });
  }
};
