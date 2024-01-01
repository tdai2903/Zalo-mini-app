// NewsComponent.js
import React from "react";
import { Box, Text, List } from "zmp-ui";
/**
 * Component danh sách tin tức ở homePage
 */
const NewsComponent = ({
  resFont,
  news,
  sortByNewest,
  resWidth,
  resHeight,
  formatCreatedTime,
  openUrlInWebview,
}) => {
  return (
    <List>
      <Box mt={2} className="bgr-color">
        <Text
          style={{
            paddingTop: "12px",
            paddingLeft: "16px",
            fontWeight: 500,
            fontSize: resFont(16),
          }}
        >
          Tin tức
        </Text>

        <List
          divider={false}
          noSpacing
          style={{
            display: "flex",
            flexWrap: "nowrap",
            overflowX: "scroll",
            margin: 0,
            padding: 0,
          }}
        >
          {sortByNewest(news)
            .slice(0, 10)
            .map((tintuc) => (
              <Box mt={3} ml={4} mb={4} key={tintuc.id}>
                <a onClick={() => openUrlInWebview(tintuc)}>
                  <Box
                    mr={1}
                    style={{
                      width: resWidth(246),
                      borderRadius: "4px",
                      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <img
                      src={tintuc.thumbnail}
                      alt="Thumbnail"
                      style={{
                        borderTopLeftRadius: "4px",
                        borderTopRightRadius: "4px",
                        height: resHeight(110),
                        objectFit: "cover",
                      }}
                    />
                    <Box p={1} style={{ height: resHeight(75) }}>
                      <Text
                        style={{
                          color: "rgba(20, 20, 21, 1)",
                          fontWeight: 500,
                          fontSize: resFont(12),
                          whiteSpace: "normal",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitBoxOrient: "vertical",
                          WebkitLineClamp: 2,
                          flex: 1,
                        }}
                      >
                        {tintuc.title}
                      </Text>
                      <Text
                        style={{
                          color: "rgba(118, 122, 127, 1)",
                          fontSize: resFont(12),
                        }}
                      >
                        {formatCreatedTime(tintuc.created_at)}
                      </Text>
                    </Box>
                  </Box>
                </a>
              </Box>
            ))}
        </List>
      </Box>
    </List>
  );
};

export default NewsComponent;
