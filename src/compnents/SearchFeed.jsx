import React from "react";
import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import Videos from "./Videos";

import { fetchFromAPI } from "../utils/fetchFromeApidata";
const SearchFeed = () => {
  const [videos, setVideos] = useState([]);
  const { searchTerm } = useParams();
  useEffect(() => {
    fetchFromAPI(
      `search?part=snippet&q=${searchTerm}&regionCode=US&relevanceLanguage=en`
    ).then(async (data) => {
      const items = data.items || [];
      const videoIds = items
        .filter((v) => v.id.videoId)
        .map((v) => v.id.videoId)
        .join(",");
      if (!videoIds) {
        setVideos([]);
        return;
      }
      // Fetch details for all videos
      const detailsData = await fetchFromAPI(
        `videos?part=snippet,contentDetails,statistics&id=${videoIds}`
      );
      // Filter out Shorts (duration <= 60s)
      import("../utils/parseDuration").then(({ parseISODuration }) => {
        const filteredVideos = (detailsData.items || []).filter(
          (v) => parseISODuration(v.contentDetails.duration) > 60
        );
        setVideos(filteredVideos);
      });
    });
  }, [searchTerm]);

  return (
    <>
      {/* videos box */}
      <Box
        p={2}
        sx={{ overflowY: "auto", height: "90vh", flex: 2, background: "#000" }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          mb={2}
          sx={{ color: "white" }}
        >
          Search rsults for
          <span style={{ color: "#fc1503" }}> {searchTerm} </span>videos
        </Typography>

        <Videos Videos={videos} />
      </Box>
    </>
  );
};

export default SearchFeed;
