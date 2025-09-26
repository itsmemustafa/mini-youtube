import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Stack,
  CircularProgress,
  Avatar,
} from "@mui/material";
import ReactPlayer from "react-player";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useParams, Link } from "react-router-dom";

import { fetchFromAPI } from "../utils/fetchFromeApidata";
import Videos from "./Videos";

const VideoDetail = () => {
  const [videoDetails, setVideoDetails] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    const fetchVideoData = async () => {
      setLoading(true);
      setRelatedLoading(true);

      try {
        // Fetch video details
        const videoData = await fetchFromAPI(
          `videos?part=snippet,contentDetails,statistics&id=${id}`
        );
        if (videoData.items && videoData.items.length > 0) {
          setVideoDetails(videoData.items[0]);
          setLoading(false);

          // Fetch related videos using alternative methods since relatedToVideoId is deprecated
          const videoSnippet = videoData.items[0]?.snippet;
          if (videoSnippet) {
            try {
              // Method 1: Get videos from the same channel
              const channelVideosData = await fetchFromAPI(
                `search?part=snippet&channelId=${videoSnippet.channelId}&type=video&maxResults=20&order=relevance`
              );

              // Method 2: Get videos with similar tags/keywords
              const searchQuery = videoSnippet.tags
                ? videoSnippet.tags.slice(0, 3).join(" ")
                : videoSnippet.title.split(" ").slice(0, 3).join(" ");
              const similarVideosData = await fetchFromAPI(
                `search?part=snippet&q=${encodeURIComponent(
                  searchQuery
                )}&type=video&maxResults=20&order=relevance`
              );

              // Combine and filter results
              const allRelatedVideos = [
                ...(channelVideosData.items || []),
                ...(similarVideosData.items || []),
              ];

              // Remove duplicates and current video
              const uniqueVideos = allRelatedVideos.filter(
                (video, index, self) =>
                  video.id.videoId !== id &&
                  index ===
                    self.findIndex((v) => v.id.videoId === video.id.videoId)
              );

              // Remove JS Mastery videos by channel title (case-insensitive)
              const filteredVideos = uniqueVideos.filter(
                (video) =>
                  video.snippet?.channelTitle?.toLowerCase() !== "js mastery" &&
                  video.snippet?.channelTitle?.toLowerCase() !==
                    "js mastery pro"
              );

              setRelatedVideos(filteredVideos.slice(0, 20));
            } catch (relatedError) {
              console.error("Error fetching related videos:", relatedError);
              setRelatedVideos([]);
            }
          }
        } else {
          setVideoDetails(null);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching video data:", error);
        setLoading(false);
      } finally {
        setRelatedLoading(false);
      }
    };

    if (id) {
      fetchVideoData();
    }
  }, [id]);

  if (loading) {
    return (
      <Box
        minHeight="95vh"
        sx={{
          backgroundColor: "#000",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress sx={{ color: "#fff" }} />
      </Box>
    );
  }

  if (!videoDetails) {
    return (
      <Box minHeight="95vh" sx={{ backgroundColor: "#000" }}>
        <Typography color="#fff" variant="h6" p={2}>
          Video not found
        </Typography>
      </Box>
    );
  }

  const formatCount = (count) => {
    return count ? parseInt(count).toLocaleString() : "0";
  };

  return (
    <Box minHeight="95vh" sx={{ backgroundColor: "#000" }}>
      <Stack direction={{ xs: "column", md: "row" }}>
        <Box flex={1}>
          <Box sx={{ width: "100%", position: "sticky", top: "86px" }}>
            <ReactPlayer
              src={`https://www.youtube.com/watch?v=${id}`}
              className="react-player"
              playing={true}
              controls={true}
              width="100%"
              height="500px"
            />

            {/* Video Title */}
            <Typography
              color="#fff"
              variant="h5"
              fontWeight="bold"
              p={2}
              sx={{
                fontSize: { xs: "1.2rem", md: "1.5rem" },
              }}
            >
              {videoDetails.snippet.title}
            </Typography>

            {/* Channel and Statistics */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              sx={{ color: "#fff" }}
              py={1}
              px={2}
              spacing={1}
            >
              {/* Channel Info */}
              <Link
                to={`/channel/${videoDetails.snippet.channelId}`}
                style={{
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                {/* Channel Avatar */}
                {videoDetails.snippet.thumbnails && (
                  <Avatar
                    src={
                      videoDetails.snippet.thumbnails.default?.url ||
                      videoDetails.snippet.thumbnails.high?.url
                    }
                    alt={videoDetails.snippet.channelTitle}
                    sx={{
                      width: { xs: 28, sm: 36 },
                      height: { xs: 28, sm: 36 },
                      mr: 1,
                    }}
                  />
                )}
                <Typography
                  variant={{ xs: "subtitle2", sm: "subtitle1", md: "h6" }}
                  color="#fff"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: { xs: "1rem", sm: "1.1rem", md: "1.2rem" },
                    "&:hover": { opacity: 0.8 },
                  }}
                >
                  {videoDetails.snippet.channelTitle}
                  <CheckCircleIcon
                    sx={{
                      fontSize: { xs: "11px", sm: "12px" },
                      color: "gray",
                      ml: "5px",
                    }}
                  />
                </Typography>
              </Link>

              {/* View Count and Likes */}
              <Stack
                direction="row"
                gap={{ xs: "10px", sm: "20px" }}
                alignItems="center"
                mt={{ xs: 1, sm: 0 }}
              >
                <Typography
                  variant="body2"
                  sx={{ opacity: 0.7, fontSize: { xs: "0.95rem", sm: "1rem" } }}
                >
                  {formatCount(videoDetails.statistics?.viewCount)} views
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ opacity: 0.7, fontSize: { xs: "0.95rem", sm: "1rem" } }}
                >
                  {formatCount(videoDetails.statistics?.likeCount)} likes
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Stack>

      {/* Related Videos */}
      <Box
        px={2}
        py={{ md: 1, xs: 5 }}
        sx={{ color: "#fff" }}
        justifyContent="center"
        alignItems="center"
      >
        <Typography variant="h6" color="#fff" mb={2}>
          Related Videos
        </Typography>
        {relatedLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress sx={{ color: "#fff" }} />
          </Box>
        ) : relatedVideos.length > 0 ? (
          <Videos Videos={relatedVideos} direction="column" />
        ) : (
          <Typography variant="body1" color="#fff" sx={{ opacity: 0.7 }}>
            No related videos found
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default VideoDetail;
