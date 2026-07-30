const { Podcast } = require("../models");
const { Op } = require("sequelize");
const { normalizeName } = require("../utils/string.helper");
const { uploadToS3, deleteFromS3, getKeyFromUrl } = require("../utils/s3.helper");

exports.createPodcast = async (req, res) => {
  try {
    const { title, description, podcast_link } = req.body;

    if (!title || !podcast_link) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: "title and podcast_link are required",
      });
    }

    let thumbnail = null;
    const thumbnailFile = req.files?.thumbnail?.[0];
    if (thumbnailFile) {
      const key = `podcast/thumbnail/${Date.now()}-${thumbnailFile.originalname}`;
      thumbnail = await uploadToS3(thumbnailFile.buffer, key, thumbnailFile.mimetype);
    }

    const podcast = await Podcast.create({
      title,
      normalized_title: normalizeName(title),
      description: description || null,
      podcast_link,
      thumbnail,
      created_by: req.user?.id,
    });

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "Podcast created successfully",
      data: podcast,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message,
    });
  }
};

exports.updatePodcast = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, podcast_link } = req.body;

    const podcast = await Podcast.findOne({ where: { id, is_delete: false } });

    if (!podcast) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: "Podcast not found",
      });
    }

    if (title) {
      podcast.title = title;
      podcast.normalized_title = normalizeName(title);
    }
    if (description !== undefined) podcast.description = description;
    if (podcast_link) podcast.podcast_link = podcast_link;

    const thumbnailFile = req.files?.thumbnail?.[0];
    if (thumbnailFile) {
      if (podcast.thumbnail) {
        const oldKey = getKeyFromUrl(podcast.thumbnail);
        if (oldKey) await deleteFromS3(oldKey);
      }
      const key = `podcast/thumbnail/${Date.now()}-${thumbnailFile.originalname}`;
      podcast.thumbnail = await uploadToS3(thumbnailFile.buffer, key, thumbnailFile.mimetype);
    }

    podcast.updated_by = req.user?.id;

    await podcast.save();

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "Podcast updated successfully",
      data: podcast,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message,
    });
  }
};

exports.getAllPodcasts = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "" } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    const whereCondition = { is_delete: false };

    if (search) {
      whereCondition.normalized_title = {
        [Op.like]: `%${normalizeName(search)}%`,
      };
    }

    const { count, rows } = await Podcast.findAndCountAll({
      where: whereCondition,
      order: [
        ["sort_order", "ASC"],
        ["id", "DESC"],
      ],
      limit,
      offset,
    });

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "Podcast list fetched",
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message,
    });
  }
};

exports.getPodcastById = async (req, res) => {
  try {
    const { id } = req.params;

    const podcast = await Podcast.findOne({ where: { id, is_delete: false } });

    if (!podcast) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: "Podcast not found",
      });
    }

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "Podcast fetched",
      data: podcast,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message,
    });
  }
};

exports.togglePodcastStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const podcast = await Podcast.findOne({ where: { id, is_delete: false } });

    if (!podcast) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: "Podcast not found",
      });
    }

    podcast.is_active = !podcast.is_active;
    podcast.updated_by = req.user?.id;

    await podcast.save();

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "Podcast status updated",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message,
    });
  }
};

exports.deletePodcast = async (req, res) => {
  try {
    const { id } = req.params;

    const podcast = await Podcast.findOne({ where: { id, is_delete: false } });

    if (!podcast) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: "Podcast not found",
      });
    }

    if (podcast.thumbnail) {
      const key = getKeyFromUrl(podcast.thumbnail);
      if (key) await deleteFromS3(key);
    }

    podcast.is_delete = true;
    podcast.updated_by = req.user?.id;

    await podcast.save();

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "Podcast deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message,
    });
  }
};
