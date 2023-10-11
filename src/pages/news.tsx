import React, { useEffect, useState } from "react";
import { Box, Page, Tabs, Text, useNavigate } from "zmp-ui";
import { NewsType } from "../type";

const NewsPage: React.FunctionComponent = () => {
  const [news, setNews] = useState<NewsType[]>([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const fetchNews = async () => {
    try {
      const response = await fetch(
        "https://cloudgo.vn/api/blogs?action=getNewPostsApp"
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const json = await response.json();
      console.log(json.data);
      setNews(json.data);
      return json.data; // Trả về dữ liệu từ API
    } catch (error) {
      console.error("Error fetching news:", error);
      return [];
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  function formatCreatedTime(createdTime: string) {
    const date = new Date(createdTime);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return `${year}-${month < 10 ? "0" : ""}${month}-${
      day < 10 ? "0" : ""
    }${day}`;
  }

  return (
    <Page hideScrollbar={true}>
      <Tabs id="contact-list">
        <Tabs.Tab
          key="tab1"
          label={
            <span style={{ fontSize: "14px", cursor: "pointer" }}>Tất cả</span>
          }
        >
          {news.map((tintuc) => (
            <Box
              mt={2}
              key={tintuc.id}
              className="section-container"
              style={{
                height: "265px",
              }}
              pt={3}
              // onClick={() => {
              //   navigate(`/detail_news/${tintuc.id}`, {
              //     state: { ...tintuc },
              //   });
              // }}
            >
              <Box
                key={tintuc.id}
                style={{ boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)" }}
              >
                <a
                  href={
                    tintuc.link_overrride ? tintuc.link_overrride : tintuc.url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "block", textDecoration: "none" }}
                >
                  <img
                    className="slide-img"
                    src={tintuc.thumbnail}
                    alt="slide-1"
                    style={{
                      borderRadius: "4px",
                      height: "120px",
                      width: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <Box p={2}>
                    <Text style={{ fontWeight: "bold" }} size="small">
                      {tintuc.title}
                    </Text>
                    <Text
                      size="small"
                      style={{
                        paddingTop: "2px",
                        color: "rgba(118, 122, 127, 1)",
                      }}
                    >
                      {formatCreatedTime(tintuc.created_at)}
                    </Text>
                    <Text
                      bold
                      style={{ paddingTop: "4px" }}
                      size="small"
                      className="two-line-text"
                    >
                      {tintuc.description}
                    </Text>
                  </Box>
                </a>
              </Box>
            </Box>
          ))}
        </Tabs.Tab>
        <Tabs.Tab
          key="tab2"
          label={
            <span style={{ fontSize: "14px", cursor: "pointer" }}>
              Hội thảo - Sự kiện
            </span>
          }
        >
          <Box
            className="section-container"
            style={{
              height: "230px",
            }}
            pt={3}
          >
            <Box style={{ boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)" }}>
              <a
                href="https://cloudgo.vn/cloudgo-tham-du-su-kien-beyond-digital"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "block", textDecoration: "none" }}
              >
                <img
                  className="slide-img"
                  src="https://cloudgo.vn/media/articles/cloudgo-tham-du-su-kien-beyond-digital_DP1SOtgVAs.png"
                  alt="slide-1"
                  style={{
                    borderRadius: "4px",
                    height: "120px",
                    width: "100%",
                    objectFit: "cover",
                  }}
                />
                <Box p={2}>
                  <Text bold size="small">
                    CloudGO vinh dự đồng hành cùng dự sự kiện VDCA Conference
                    2023 Beyond Digital
                  </Text>
                  <Text>14/08/2023</Text>
                </Box>
              </a>
            </Box>
          </Box>
          <Box
            mt={2}
            className="section-container"
            style={{
              height: "230px",
            }}
            pt={3}
          >
            <Box style={{ boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)" }}>
              <a
                href="https://cloudgo.vn/cloudgo-tham-du-su-kien-beyond-digital"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "block", textDecoration: "none" }}
              >
                <img
                  className="slide-img"
                  src="https://cloudgo.vn/media/articles/cloudgo-tham-du-su-kien-beyond-digital_DP1SOtgVAs.png"
                  alt="slide-1"
                  style={{
                    borderRadius: "4px",
                    height: "120px",
                    width: "100%",
                    objectFit: "cover",
                  }}
                />
                <Box p={2}>
                  <Text bold size="small">
                    CloudGO vinh dự đồng hành cùng dự sự kiện VDCA Conference
                    2023 Beyond Digital
                  </Text>
                  <Text>14/08/2023</Text>
                </Box>
              </a>
            </Box>
          </Box>
          <Box
            mt={2}
            className="section-container"
            style={{
              height: "230px",
            }}
            pt={3}
          >
            <Box style={{ boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)" }}>
              <a
                href="https://talks.cloudgo.vn/talks-4?utm_source=website&utm_medium=org&utm_content=post"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "block", textDecoration: "none" }}
              >
                <img
                  className="slide-img"
                  src="https://cloudgo.vn/media/articles/ky-nang-va-cong-cu-ban-hang-b2b-hieu-qua_9QZ7lxgJ1d.png"
                  alt="slide-1"
                  style={{
                    borderRadius: "4px",
                    height: "120px",
                    width: "100%",
                    objectFit: "cover",
                  }}
                />
                <Box p={2}>
                  <Text bold size="small">
                    [CloudGO Talks #4] Kỹ năng và công cụ bán hàng B2B hiệu quả
                  </Text>
                  <Text>11/08/2023</Text>
                </Box>
              </a>
            </Box>
          </Box>
        </Tabs.Tab>
        <Tabs.Tab
          key="tab3"
          label={
            <span style={{ fontSize: "14px", cursor: "pointer" }}>
              CloudGO cập nhật
            </span>
          }
        >
          <Box
            className="section-container"
            style={{
              height: "230px",
            }}
            pt={3}
          >
            <Box style={{ boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)" }}>
              <a
                href="https://cloudgo.vn/cloudgo-chinh-thuc-tro-thanh-hoi-vien-vdca"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "block", textDecoration: "none" }}
              >
                <img
                  className="slide-img"
                  src="https://cloudgo.vn/media/articles/cloudgo-chinh-thuc-tro-thanh-hoi-vien-vdca_r8zsIP998D.png"
                  alt="slide-1"
                  style={{
                    borderRadius: "4px",
                    height: "120px",
                    width: "100%",
                    objectFit: "cover",
                  }}
                />
                <Box p={2}>
                  <Text bold size="small">
                    CloudGO chính thức trở thành hội viên của Hội Truyền thông
                    số Việt Nam (VDCA)
                  </Text>
                  <Text>15/08/2023</Text>
                </Box>
              </a>
            </Box>
          </Box>
          <Box
            mt={2}
            className="section-container"
            style={{
              height: "230px",
            }}
            pt={3}
          >
            <Box style={{ boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)" }}>
              <a
                href="https://cloudgo.vn/cloudgo-to-chuc-giai-bong-da-cup-tu-hung"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "block", textDecoration: "none" }}
              >
                <img
                  className="slide-img"
                  src="https://cloudgo.vn/media/articles/cloudgo-to-chuc-giai-bong-da-cup-tu-hung_EisatMKS1y.png"
                  alt="slide-1"
                  style={{
                    borderRadius: "4px",
                    height: "120px",
                    width: "100%",
                    objectFit: "cover",
                  }}
                />
                <Box p={2}>
                  <Text bold size="small">
                    CLOUDGO TỔ CHỨC GIẢI BÓNG ĐÁ CUP TỨ HÙNG LẦN I
                  </Text>
                  <Text>07/08/2023</Text>
                </Box>
              </a>
            </Box>
          </Box>
          <Box
            mt={2}
            className="section-container"
            style={{
              height: "230px",
            }}
            pt={3}
          >
            <Box style={{ boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)" }}>
              <a
                href="https://cloudgo.vn/hoi-thao-tich-hop-tong-the-cac-giai-phap-gonsa"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "block", textDecoration: "none" }}
              >
                <img
                  className="slide-img"
                  src="https://cloudgo.vn/media/articles/hoi-thao-tich-hop-tong-the-cac-giai-phap-gonsa_fLugViN4Nc.png"
                  alt="slide-1"
                  style={{
                    borderRadius: "4px",
                    height: "120px",
                    width: "100%",
                    objectFit: "cover",
                  }}
                />
                <Box p={2}>
                  <Text bold size="small">
                    Hội thảo tích hợp tổng thể các giải pháp trong bản đồ chuyển
                    đổi số Gonsa 2023
                  </Text>
                  <Text>28/08/2023</Text>
                </Box>
              </a>
            </Box>
          </Box>
        </Tabs.Tab>
      </Tabs>
    </Page>
  );
};
export default NewsPage;
