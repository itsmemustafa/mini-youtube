import React from "react";
import { Stack, Box, CircularProgress } from "@mui/material";
import { VideoCard } from "./";
import { ChannelCard } from "./";
const Videos = ({ Videos ,direction }) => {
  if (!Videos?.length)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          height: "75vh",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  return (
    <Stack
     loading="lazy"
      direction={direction||"row"}
      flexWrap="wrap"
      justifyContent="center"
      alignItems="center"
      gap={2}
    >
      {Videos.map((item, idx) => {
        return (
          <Box key={idx}>
            {item.id.videoId && <VideoCard video={item} />}
            {item.id.channelId && <ChannelCard channelDetail={item} />}
          </Box>
        );
      })}
    </Stack>
  );
};

export default Videos;
