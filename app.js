require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

const allowedOrigins = [
  "https://esgastraa.com",
  "https://www.esgastraa.com",
  "https://oneconnectx.com",
  "http://localhost:5000",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3005",
  "http://localhost:3006",

];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRoutes = require("./routes/auth.routes");
const categoryRoutes = require("./routes/category.routes");
const caseStudyRoutes = require("./routes/caseStudy.routes");
const whitePaperRoutes = require("./routes/whitePaper.routes");
const whitePaperCategoryRoutes = require("./routes/whitePaperCategory.routes");
const caseStudyDownloadRoutes = require("./routes/caseStudyDownload.routes");
const whitePaperDownloadRoutes = require("./routes/whitePaperDownload.routes");
const blogRoutes = require("./routes/blog.routes");
const blogDownloadRoutes = require("./routes/blogDownload.routes");
const publicRoutes = require("./routes/public.routes");
const industriesRoutes = require("./routes/industries.routes");
const contactRoutes = require("./routes/contact.routes");
const announcementRoutes = require("./routes/announcement.routes");
const homeFaqRoutes = require("./routes/homeFaq.routes");
const featuredInsightRoutes = require("./routes/featuredInsight.routes");
const podcastRoutes = require("./routes/podcast.routes");
const jobOpeningRoutes = require("./routes/jobOpening.routes");
const jobApplicationRoutes = require("./routes/jobApplication.routes");

app.use("/api/auth", authRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/white-paper", whitePaperRoutes);
app.use("/api/white-paper-category", whitePaperCategoryRoutes);
app.use("/api/case-study", caseStudyRoutes);
app.use("/api/case-study-download", caseStudyDownloadRoutes);
app.use("/api/white-paper-download", whitePaperDownloadRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/blog-download", blogDownloadRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/industries", industriesRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/announcement", announcementRoutes);
app.use("/api/home-faq", homeFaqRoutes);
app.use("/api/featured-insight", featuredInsightRoutes);
app.use("/api/podcast", podcastRoutes);
app.use("/api/job-opening", jobOpeningRoutes);
app.use("/api/job-application", jobApplicationRoutes);

app.get("/", (req, res) => {
  res.send("API Running...");
});

app.use((req, res) => {
  res.status(404).json({
    status: false,
    responseCode: 404,
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    status: false,
    responseCode: 500,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
