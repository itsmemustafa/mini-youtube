import React from "react";

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box } from "@mui/material";
import ChannelCard from "./ChannelCard";
import Videos from "./Videos";
import { fetchFromAPI } from "../utils/fetchFromeApidata";

const ChannelDetail = () => {
  const [channelDetail, setChannelDetail] = useState();
  const [videos, setVideos] = useState([]);

  const { id } = useParams();

  useEffect(() => {
    const fetchResults = async () => {
      const data = await fetchFromAPI(`channels?part=snippet&id=${id}`);

      setChannelDetail(data?.items[0]);

      const videosData = await fetchFromAPI(
        `search?channelId=${id}&part=snippet%2Cid&order=date`
      );
      console.log("videosData FULL:", JSON.stringify(videosData, null, 2));

      setVideos(videosData?.items);
    };

    fetchResults();
  }, [id]);
  return (
    <Box minHeight="95vh" sx={{ background: "#000" }}>
      <Box>
        <div
          style={{
            height: "300px",
            background: (() => {
              const img =
                channelDetail?.brandingSettings?.image
                  ?.bannerTabletExtraHdImageUrl ||
                channelDetail?.brandingSettings?.image
                  ?.bannerTabletHdImageUrl ||
                channelDetail?.brandingSettings?.image
                  ?.bannerMobileExtraHdImageUrl ||
                channelDetail?.brandingSettings?.image
                  ?.bannerMobileHdImageUrl ||
                channelDetail?.brandingSettings?.image?.bannerExternalUrl;
              return img
                ? `url(${img}) center/cover no-repeat`
                : "linear-gradient(90deg, rgba(0,238,247,1) 0%, rgba(206,3,184,1) 100%, rgba(0,212,255,1) 100%)";
            })(),
            zIndex: 10,
          }}
        />
        <ChannelCard channelDetail={channelDetail} marginTop="-93px" />
      </Box>
      <Box p={2} display="flex">
        <Box sx={{ mr: { sm: "100px" } }} />
        <Videos Videos={videos} />
      </Box>
    </Box>
  );
};

export default ChannelDetail;
