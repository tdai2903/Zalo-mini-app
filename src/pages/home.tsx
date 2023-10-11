import React, { useEffect, useState } from "react";
import {
  Page,
  Icon,
  useNavigate,
  Box,
  Text,
  Input,
  Tabs,
  Swiper,
  Sheet,
  Button,
  Modal,
} from "zmp-ui";
import { NewsType, TicketType } from "../type";
import {
  getUserInfo,
  configAppView,
  onConfirmToExit,
  offConfirmToExit,
  closeApp,
} from "zmp-sdk/apis";

import axios from "axios";
import { requestSendNotification } from "zmp-sdk/apis";
const HomePage: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const [res, setRes] = useState<TicketType[]>([]);
  const [news, setNews] = useState<NewsType[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [allTickets, setAllTickets] = useState<TicketType[]>([]);
  const [visibleTicketsCount, setVisibleTicketsCount] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const token = localStorage.getItem("token");
  const [openTickets, setOpenTickets] = useState<TicketType[]>([]);
  const [inProgressTickets, setInProgressTickets] = useState<TicketType[]>([]);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [apiCalled, setApiCalled] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [sortedAndFilteredTickets, setSortedAndFilteredTickets] = useState<
    TicketType[]
  >([]);
  const contactData = JSON.parse(localStorage.getItem("contact") || "{}");
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [closedTickets, setClosedTickets] = useState<TicketType[]>([]);
  const [totalAllTickets, setTotalAllTickets] = useState<number>(0);
  const [totalOpenTickets, setTotalOpenTickets] = useState<number>(0);
  const [totalInProgressTickets, setTotalInProgressTickets] =
    useState<number>(0);
  const [totalClosedTickets, setTotalClosedTickets] = useState<number>(0);
  const [currentTab, setCurrentTab] = useState("tab1");
  const [userInfo, setUserInfo] = useState({
    id: "",
    name: "",
    avatar: "",
  });

  const configView = async () => {
    try {
      await configAppView({
        headerColor: "#1843EF",
        headerTextColor: "white",
        hideAndroidBottomNavigationBar: true,
        hideIOSSafeAreaBottom: true,
        actionBar: {
          title: "My CloudGO",
          leftButton: "back",
        },
      });
      // xử lý khi gọi api thành công
    } catch (error) {
      // xử lý khi gọi api thất bại
    }
  };

  const sendNotification = async () => {
    requestSendNotification({
      success: () => {
        console.log("Cho phép gửi thông báo");
      },
      fail: (error) => {
        console.log(error);
      },
    });
  };

  useEffect(() => {
    onConfirmToExit(() => setConfirmModalVisible(true));
    return () => offConfirmToExit();
  }, []);

  useEffect(() => {
    if (!apiCalled) {
      getUserInfo({
        success: (data) => {
          const Info = data;
          console.log("Get User Info Success", data);

          const [firstname, lastname] = Info.userInfo.name.split(" ");

          const updatedUserInfo = {
            ...Info.userInfo,
            firstname: firstname,
            lastname: lastname,
          };

          setUserInfo(updatedUserInfo);
          saveContact({ name: updatedUserInfo.name, id: updatedUserInfo.id });
          getContact(updatedUserInfo.id);
          localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
        },
        fail: (error) => {
          console.log(error);
        },
      });
    }
  }, [apiCalled]);

  const saveContact = async ({ name, id }) => {
    const phoneNumber = localStorage.getItem("phoneNumber");
    console.log(phoneNumber);
    const [firstname, lastname] = name.split(" ");
    const headers = {
      "Content-Type": "application/json",
    };

    if (token !== null) {
      headers["token"] = token;
    }
    axios
      .post(
        "https://pms-dev.cloudpro.vn/api/SalesAppApi.php",
        {
          RequestAction: "CheckIdZaloApp",
          Data: {
            firstname: lastname,
            lastname: firstname,
            mobile: phoneNumber,
            zalo_id_miniapp: id,
          },
        },
        {
          headers: headers,
        }
      )
      .then((response) => {
        console.log("Đã lưu contact:", response.data);
      })
      .catch((error) => {
        console.error("Lỗi khi lưu contat:", error);
      });
  };

  const getContact = async (id) => {
    const headers = {
      "Content-Type": "application/json",
    };

    if (token !== null) {
      headers["token"] = token;
    }
    axios
      .post(
        "https://pms-dev.cloudpro.vn/api/SalesAppApi.php",
        {
          RequestAction: "GetContactByZaloId",
          Data: {
            zalo_id_miniapp: id,
          },
        },
        {
          headers: headers,
        }
      )
      .then((response) => {
        const contactData = response.data;
        console.log("Contact Data:", contactData);
        localStorage.setItem("contact", JSON.stringify(contactData));
      })
      .catch((error) => {
        console.error("Lỗi khi get contact:", error);
      });
  };

  const fetchTickets = async () => {
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      if (token !== null) {
        headers["token"] = token;
      }
      axios
        .post(
          "https://pms-dev.cloudpro.vn/api/SalesAppApi.php",
          JSON.stringify({
            RequestAction: "GetTicketList",
            Params: {
              cv_id: "",
              keyword: "",
              filters: {
                category: "",
              },
              paging: {
                order_by: "",
                offset: 0,
                max_results: 50,
              },
              ordering: {
                createdtime: "DESC",
                priority: "DESC",
              },
              filter_by: "all",
            },
          }),
          {
            headers: headers,
          }
        )
        .then((response) => {
          console.log("Danh sách ticket:", response.data.entry_list);
          const json = response.data.entry_list;
          setRes(json);
          return json;
        });
    } catch (error) {
      if (error === "SyntaxError: Unexpected token T in JSON at position 0") {
        navigate("/");
      } else {
        console.error(error);
      }
    }
  };

  const fetchNews = async () => {
    try {
      const response = await fetch(
        "https://cloudgo.vn/api/blogs?action=getNewPostsApp"
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const json = await response.json();

      console.log("Tin tức:", json.data);
      setNews(json.data);
      return json.data;
    } catch (error) {
      console.error("Error fetching news:", error);
      return [];
    }
  };

  const followTicket = (ticketid) => {
    const headers = {
      "Content-Type": "application/json",
    };

    if (token !== null) {
      headers["token"] = token;
    }

    axios
      .post(
        "https://pms-dev.cloudpro.vn/api/SalesAppApi.php",
        JSON.stringify({
          RequestAction: "SaveStar",
          Params: {
            module: "Contacts",
            id: ticketid,
            starred: 1,
          },
        }),
        {
          headers: headers,
        }
      )
      .then((response) => {
        console.log("Đã theo dõi:", response.data);
        setIsFollowing(true);
      })
      .catch((error) => {
        console.error("Lỗi khi follow:", error);
      });
  };

  const unfollowTicket = (ticketid) => {
    const headers = {
      "Content-Type": "application/json",
    };

    if (token !== null) {
      headers["token"] = token;
    }

    axios
      .post(
        "https://pms-dev.cloudpro.vn/api/SalesAppApi.php",
        JSON.stringify({
          RequestAction: "SaveStar",
          Params: {
            module: "Contacts",
            id: ticketid,
            starred: 0,
          },
        }),
        {
          headers: headers,
        }
      )
      .then((response) => {
        console.log("Hủy theo dõi:", response.data);
        setIsFollowing(false);
      })
      .catch((error) => {
        console.error("Lỗi khi follow:", error);
      });
  };

  const Logout = () => {
    const headers = {
      "Content-Type": "application/json",
    };

    if (token !== null) {
      headers["token"] = token;
    }

    axios
      .post(
        "https://pms-dev.cloudpro.vn/api/SalesAppApi.php",
        JSON.stringify({
          RequestAction: "Logout",
        }),
        {
          headers: headers,
        }
      )
      .then((response) => {
        console.log("Đăng xuất thành công:", response.data);
        setIsFollowing(false);
      })
      .catch((error) => {
        console.error("Đăng xuất thất bại:", error);
      });
  };

  const closeMiniApp = async () => {
    try {
      await closeApp({});
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUserInfo();
    configView();
    fetchNews();
    sendNotification();
    fetchTickets();
  }, []);

  // Sắp xếp mảng theo trạng thái 'starred' - các ticket 'starred' sẽ lên đầu
  const filterAndSortTickets = (
    tickets: TicketType[],
    status: string
  ): TicketType[] => {
    let filtered = tickets.filter((ticket) => {
      if (status === "tab1") {
        return true;
      } else if (status === "tab2") {
        return ["Open", "Reopen", "Wait For Verifying"].includes(ticket.status);
      } else if (status === "tab3") {
        return [
          "In Progress",
          "Wait Close",
          "Assigned",
          "Customer Confirmed",
        ].includes(ticket.status);
      } else if (status === "tab4") {
        return ticket.status === "Closed";
      }
      return false;
    });

    if (sortBy === "newest") {
      filtered = filtered.sort((a, b) => {
        // Sắp xếp theo giá trị starred giảm dần (các ticket starred = 1 lên đầu)
        const starredA = parseInt(a.starred);
        const starredB = parseInt(b.starred);

        if (starredA > starredB) {
          return -1;
        } else if (starredA < starredB) {
          return 1;
        }

        const dateA = new Date(a.createdtime).getTime();
        const dateB = new Date(b.createdtime).getTime();
        return dateB - dateA;
      });
    } else if (sortBy === "oldest") {
      filtered = filtered.sort((a, b) => {
        const dateA = new Date(a.createdtime).getTime();
        const dateB = new Date(b.createdtime).getTime();
        return dateA - dateB;
      });
    }

    return filtered;
  };

  useEffect(() => {
    const openTickets = filterAndSortTickets(res, "tab2");
    const inProgressTickets = filterAndSortTickets(res, "tab3");
    const closedTickets = filterAndSortTickets(res, "tab4");

    setAllTickets(res);
    setTotalAllTickets(res.length);
    setTotalOpenTickets(openTickets.length);
    setTotalInProgressTickets(inProgressTickets.length);
    setTotalClosedTickets(closedTickets.length);

    setOpenTickets(openTickets);
    setInProgressTickets(inProgressTickets);
    setClosedTickets(closedTickets);
  }, [res]);

  useEffect(() => {
    const filteredAndSorted = filterAndSortTickets(res, currentTab);
    setSortedAndFilteredTickets(filteredAndSorted);
  }, [currentTab, sortBy, res]);

  function formatCreatedTime(createdTime: string) {
    const date = new Date(createdTime);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return `${year}-${month < 10 ? "0" : ""}${month}-${
      day < 10 ? "0" : ""
    }${day}`;
  }

  const handleSortByChange = (sortValue: string) => {
    setSortBy(sortValue);
    const filteredAndSorted = filterAndSortTickets(res, currentTab);
    setSortedAndFilteredTickets(filteredAndSorted);
  };

  const sortByNewest = (arr: TicketType[] | NewsType[]) => {
    return arr.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });
  };

  const handleShowAllTickets = () => {
    if (showAllTickets) {
      setShowAllTickets(false);
      setVisibleTicketsCount(20);
    } else {
      setIsLoading(true);

      setTimeout(() => {
        setShowAllTickets(true);
        setVisibleTicketsCount(sortedAndFilteredTickets.length);
        setIsLoading(false); // Kết thúc loading sau 2 giây
      }, 2000); // Thời gian loading là 2 giây (2000 ms)
    }
  };

  return (
    <Page hideScrollbar={true}>
      <Box p={3} className="bgr-color">
        <Box flex flexDirection="row" alignContent="center">
          <img src={userInfo.avatar} alt="Avatar" className="avatar" />
          <Text style={{ paddingLeft: "6px", paddingRight: "8px" }}>
            Xin chào,
          </Text>
          <Text bold size="large">
            {contactData.data.full_name}
          </Text>
        </Box>
      </Box>
      <Box mt={2} className="section-container">
        <Box
          flex
          flexDirection="row"
          justifyContent="space-between"
          alignContent="center"
        >
          <Text bold size="xLarge">
            Tin tức
          </Text>
          {/* <Box onClick={() => navigate("/news")}>
            <Icon icon="zi-chevron-right" style={{ cursor: "pointer" }}></Icon>
          </Box> */}
        </Box>
        <Box
          mt={3}
          style={{
            borderRadius: "8px",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
          }}
        >
          <Swiper autoplay duration={2000} loop dots={false}>
            {sortByNewest(news)
              .slice(0, 3)
              .map((tintuc) => (
                <Swiper.Slide key={tintuc.id}>
                  <a
                    href={tintuc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "block", textDecoration: "none" }}
                  >
                    <img
                      className="slide-img"
                      src={tintuc.thumbnail}
                      alt="slide-1"
                      style={{
                        borderTopLeftRadius: "8px",
                        borderTopRightRadius: "8px",
                        height: "120px",
                        width: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <Box p={2}>
                      <Text bold size="small">
                        {tintuc.title}
                      </Text>
                      <Text>{formatCreatedTime(tintuc.created_at)}</Text>
                    </Box>
                  </a>
                </Swiper.Slide>
              ))}
          </Swiper>
        </Box>
      </Box>
      <Box
        mt={2}
        flexDirection="row"
        justifyContent="space-between"
        className="bgr-color"
      >
        <Box
          pt={2}
          pl={4}
          flexDirection="row"
          alignContent="center"
          justifyContent="space-between"
        >
          <Input.Search
            style={{
              borderRadius: "8px",
              border: "2px solid #ccc",
              fontSize: "16px",
              width: "320px",
            }}
            size="small"
            type="text"
            placeholder="Tìm nhanh ticket"
            value={searchText}
            onClick={() => {
              navigate(`/search_ticket?q=${searchText}`);
            }}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Box>
        <Box
          onClick={() => {
            setActionSheetVisible(true);
            setSheetVisible(true);
          }}
        >
          <Icon
            icon="zi-filter"
            size={35}
            style={{
              marginTop: "14px",
              cursor: "pointer",
            }}
          />
        </Box>
        <Sheet.Actions
          mask
          visible={actionSheetVisible}
          title="Sắp xếp theo"
          onClose={() => setActionSheetVisible(false)}
          swipeToClose
          height="220px"
          actions={[
            [
              {
                text: "Mới nhất",
                close: true,
                onClick: () => {
                  handleSortByChange("newest");
                  setActionSheetVisible(false);
                },
              },
              {
                text: "Cũ nhất",
                close: true,
                onClick: () => {
                  handleSortByChange("oldest");
                  setActionSheetVisible(false);
                },
              },
            ],
            [{ text: "Hủy", close: true }],
          ]}
        />
      </Box>
      <Tabs
        activeKey={currentTab}
        onTabClick={(tabKey) => setCurrentTab(tabKey)}
      >
        <Tabs.Tab
          key="tab1"
          label={
            <span style={{ fontSize: "14px", cursor: "pointer" }}>
              {currentTab === "tab1" ? `Tất cả (${totalAllTickets})` : "Tất cả"}
            </span>
          }
          style={{ flex: 1 }}
        >
          {sortedAndFilteredTickets
            .slice(0, visibleTicketsCount)
            .map((ticket) => (
              <Box key={ticket.ticketid}>
                <Box mt={1} className="section-container" key={ticket.ticketid}>
                  <Box
                    flexDirection="row"
                    alignContent="center"
                    justifyContent="space-between"
                  >
                    <Text
                      bold
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        cursor: "pointer",
                        textOverflow: "ellipsis",
                        paddingRight: "6px",
                      }}
                      onClick={() => {
                        navigate(`/detail_ticket/${ticket.ticketid}`, {
                          state: { ...ticket, images: selectedImages },
                        });
                      }}
                    >
                      {ticket.title}
                    </Text>
                    {ticket.starred === "1" ? (
                      <div
                        style={{
                          color: "red",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          unfollowTicket(ticket.ticketid);
                          const updatedTicket = { ...ticket, starred: "0" };
                          setRes((prevRes) =>
                            prevRes.map((t) =>
                              t.ticketid === ticket.ticketid ? updatedTicket : t
                            )
                          );
                        }}
                      >
                        <Icon icon="zi-heart-solid">{ticket.starred}</Icon>
                      </div>
                    ) : (
                      <div
                        style={{
                          color: "grey",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          followTicket(ticket.ticketid);
                          const updatedTicket = { ...ticket, starred: "1" };
                          setRes((prevRes) =>
                            prevRes.map((t) =>
                              t.ticketid === ticket.ticketid ? updatedTicket : t
                            )
                          );
                        }}
                      >
                        <Icon icon="zi-heart">{ticket.starred}</Icon>
                      </div>
                    )}
                  </Box>
                  <Box mt={1} flexDirection="row" alignContent="center">
                    <Icon icon="zi-more-grid"></Icon>
                    <Text style={{ paddingLeft: "6px" }}>
                      {ticket.ticket_no}
                    </Text>
                    <Box style={{ width: "50%" }}></Box>
                    <Text>{formatCreatedTime(ticket.createdtime)}</Text>
                  </Box>
                  <Box
                    flexDirection="row"
                    alignContent="center"
                    justifyContent="space-between"
                  >
                    <Box mt={1} flexDirection="row" alignContent="center">
                      <Icon icon="zi-star" />
                      <Text
                        style={{
                          fontSize: "16px",
                          paddingLeft: "6px",
                        }}
                      >
                        {ticket.starred}
                      </Text>
                    </Box>
                    <Box
                      className="status"
                      mt={1}
                      flexDirection="row"
                      alignContent="center"
                      justifyContent="center"
                      style={{
                        backgroundColor: statusColors[ticket.status],
                        display: "inline-block",
                        minWidth: "20%",
                        textAlign: "center",
                        padding: "4px 20px",
                        marginRight: "16px",
                        borderRadius: "16px",
                      }}
                    >
                      <Text style={{ color: statusTextColors[ticket.status] }}>
                        {translationStatus[ticket.status]}
                      </Text>
                    </Box>
                  </Box>
                </Box>
                <Box className="list-container" height={4}></Box>
              </Box>
            ))}
          <Button
            variant="tertiary"
            style={{ alignContent: "center" }}
            onClick={handleShowAllTickets}
            disabled={isLoading}
          >
            {isLoading
              ? "Loading..."
              : showAllTickets
              ? "Ẩn bớt"
              : "Hiển thị thêm"}
            <Icon
              icon={showAllTickets ? "zi-chevron-up" : "zi-chevron-down"}
              size={25}
            />
          </Button>
          <Box height={50}></Box>
        </Tabs.Tab>
        <Tabs.Tab
          key="tab2"
          label={
            <span style={{ fontSize: "14px", cursor: "pointer" }}>
              {currentTab === "tab2" ? `Mới (${totalOpenTickets})` : "Mới"}
            </span>
          }
          style={{ flex: 1 }}
        >
          {openTickets.slice(0, visibleTicketsCount).map((ticket) => (
            <Box key={ticket.ticketid}>
              <Box mt={1} className="section-container" key={ticket.ticketid}>
                <Box
                  flexDirection="row"
                  alignContent="center"
                  justifyContent="space-between"
                >
                  <Text
                    bold
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      paddingRight: "6px",
                    }}
                    onClick={() => {
                      navigate(`/detail_ticket/${ticket.ticketid}`, {
                        state: { ...ticket, images: selectedImages },
                      });
                    }}
                  >
                    {ticket.title}
                  </Text>

                  {ticket.starred === "1" ? (
                    <div
                      style={{
                        color: "red",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        unfollowTicket(ticket.ticketid);
                        const updatedTicket = { ...ticket, starred: "0" };
                        setRes((prevRes) =>
                          prevRes.map((t) =>
                            t.ticketid === ticket.ticketid ? updatedTicket : t
                          )
                        );
                      }}
                    >
                      <Icon icon="zi-heart-solid">{ticket.starred}</Icon>
                    </div>
                  ) : (
                    <div
                      style={{
                        color: "grey",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        followTicket(ticket.ticketid);
                        const updatedTicket = { ...ticket, starred: "1" };
                        setRes((prevRes) =>
                          prevRes.map((t) =>
                            t.ticketid === ticket.ticketid ? updatedTicket : t
                          )
                        );
                      }}
                    >
                      <Icon icon="zi-heart">{ticket.starred}</Icon>
                    </div>
                  )}
                </Box>
                <Box mt={1} flexDirection="row" alignContent="center">
                  <Icon icon="zi-more-grid"></Icon>
                  <Text style={{ paddingLeft: "6px" }}>{ticket.ticket_no}</Text>
                  <Box style={{ width: "50%" }}></Box>
                  <Text>{formatCreatedTime(ticket.createdtime)}</Text>
                </Box>
                <Box
                  flexDirection="row"
                  alignContent="center"
                  justifyContent="space-between"
                >
                  <Box mt={1} flexDirection="row" alignContent="center">
                    <Icon icon="zi-star" />
                    <Text
                      style={{
                        fontSize: "16px",
                        paddingLeft: "6px",
                      }}
                    >
                      {ticket.starred}
                    </Text>
                  </Box>
                  <Box
                    className="status"
                    mt={1}
                    flexDirection="row"
                    alignContent="center"
                    justifyContent="center"
                    style={{
                      backgroundColor: statusColors[ticket.status],
                      display: "inline-block",
                      minWidth: "20%",
                      textAlign: "center",
                      padding: "4px 20px",
                      marginRight: "16px",
                      borderRadius: "16px",
                    }}
                  >
                    <Text style={{ color: statusTextColors[ticket.status] }}>
                      {translationStatus[ticket.status]}
                    </Text>
                  </Box>
                </Box>
              </Box>
              <Box className="list-container" height={4}></Box>
            </Box>
          ))}
          <Button
            variant="tertiary"
            style={{ alignContent: "center" }}
            onClick={handleShowAllTickets}
            disabled={isLoading}
          >
            {isLoading
              ? "Loading..."
              : showAllTickets
              ? "Ẩn bớt"
              : "Hiển thị thêm"}
            <Icon
              icon={showAllTickets ? "zi-chevron-up" : "zi-chevron-down"}
              size={25}
            />
          </Button>
          <Box height={50}></Box>
        </Tabs.Tab>
        <Tabs.Tab
          key="tab3"
          label={
            <span style={{ fontSize: "14px", cursor: "pointer" }}>
              {currentTab === "tab3"
                ? `Đang xử lý (${totalInProgressTickets})`
                : "Đang xử lý"}
            </span>
          }
          style={{ flex: 1 }}
        >
          {inProgressTickets.slice(0, visibleTicketsCount).map((ticket) => (
            <Box key={ticket.ticketid}>
              <Box mt={1} className="section-container" key={ticket.ticketid}>
                <Box
                  flexDirection="row"
                  alignContent="center"
                  justifyContent="space-between"
                >
                  <Text
                    bold
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      paddingRight: "6px",
                    }}
                    onClick={() => {
                      navigate(`/detail_ticket/${ticket.ticketid}`, {
                        state: { ...ticket, images: selectedImages },
                      });
                    }}
                  >
                    {ticket.title}
                  </Text>

                  {ticket.starred === "1" ? (
                    <div
                      style={{
                        color: "red",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        unfollowTicket(ticket.ticketid);
                        const updatedTicket = { ...ticket, starred: "0" };
                        setRes((prevRes) =>
                          prevRes.map((t) =>
                            t.ticketid === ticket.ticketid ? updatedTicket : t
                          )
                        );
                      }}
                    >
                      <Icon icon="zi-heart-solid">{ticket.starred}</Icon>
                    </div>
                  ) : (
                    <div
                      style={{
                        color: "grey",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        followTicket(ticket.ticketid);
                        const updatedTicket = { ...ticket, starred: "1" };
                        setRes((prevRes) =>
                          prevRes.map((t) =>
                            t.ticketid === ticket.ticketid ? updatedTicket : t
                          )
                        );
                      }}
                    >
                      <Icon icon="zi-heart">{ticket.starred}</Icon>
                    </div>
                  )}
                </Box>
                <Box mt={1} flexDirection="row" alignContent="center">
                  <Icon icon="zi-more-grid"></Icon>
                  <Text style={{ paddingLeft: "6px" }}>{ticket.ticket_no}</Text>
                  <Box style={{ width: "50%" }}></Box>
                  <Text>{formatCreatedTime(ticket.createdtime)}</Text>
                </Box>
                <Box
                  flexDirection="row"
                  alignContent="center"
                  justifyContent="space-between"
                >
                  <Box mt={1} flexDirection="row" alignContent="center">
                    <Icon icon="zi-star" />
                    <Text
                      style={{
                        fontSize: "16px",
                        paddingLeft: "6px",
                      }}
                    >
                      {ticket.starred}
                    </Text>
                  </Box>
                  <Box
                    className="status"
                    mt={1}
                    flexDirection="row"
                    alignContent="center"
                    justifyContent="center"
                    style={{
                      backgroundColor: statusColors[ticket.status],
                      display: "inline-block",
                      minWidth: "20%",
                      textAlign: "center",
                      padding: "4px 20px",
                      marginRight: "16px",
                      borderRadius: "16px",
                    }}
                  >
                    <Text style={{ color: statusTextColors[ticket.status] }}>
                      {translationStatus[ticket.status]}
                    </Text>
                  </Box>
                </Box>
              </Box>
              <Box className="list-container" height={4}></Box>
            </Box>
          ))}
          <Button
            variant="tertiary"
            style={{ alignContent: "center" }}
            onClick={handleShowAllTickets}
            disabled={isLoading}
          >
            {isLoading
              ? "Loading..."
              : showAllTickets
              ? "Ẩn bớt"
              : "Hiển thị thêm"}
            <Icon
              icon={showAllTickets ? "zi-chevron-up" : "zi-chevron-down"}
              size={25}
            />
          </Button>
          <Box height={50}></Box>
        </Tabs.Tab>
        <Tabs.Tab
          key="tab4"
          label={
            <span style={{ fontSize: "14px", cursor: "pointer" }}>
              {currentTab === "tab4"
                ? `Hoàn thành (${totalClosedTickets})`
                : "Hoàn thành"}
            </span>
          }
          style={{ flex: 1 }}
        >
          {closedTickets.slice(0, visibleTicketsCount).map((ticket) => (
            <Box key={ticket.ticketid}>
              <Box mt={1} className="section-container" key={ticket.ticketid}>
                <Box
                  flexDirection="row"
                  alignContent="center"
                  justifyContent="space-between"
                >
                  <Text
                    bold
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      paddingRight: "6px",
                    }}
                    onClick={() => {
                      navigate(`/detail_ticket/${ticket.ticketid}`, {
                        state: { ...ticket, images: selectedImages },
                      });
                    }}
                  >
                    {ticket.title}
                  </Text>

                  {ticket.starred === "1" ? (
                    <div
                      style={{
                        color: "red",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        unfollowTicket(ticket.ticketid);
                        const updatedTicket = { ...ticket, starred: "0" };
                        setRes((prevRes) =>
                          prevRes.map((t) =>
                            t.ticketid === ticket.ticketid ? updatedTicket : t
                          )
                        );
                      }}
                    >
                      <Icon icon="zi-heart-solid">{ticket.starred}</Icon>
                    </div>
                  ) : (
                    <div
                      style={{
                        color: "grey",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        followTicket(ticket.ticketid);
                        const updatedTicket = { ...ticket, starred: "1" };
                        setRes((prevRes) =>
                          prevRes.map((t) =>
                            t.ticketid === ticket.ticketid ? updatedTicket : t
                          )
                        );
                      }}
                    >
                      <Icon icon="zi-heart">{ticket.starred}</Icon>
                    </div>
                  )}
                </Box>
                <Box mt={1} flexDirection="row" alignContent="center">
                  <Icon icon="zi-more-grid"></Icon>
                  <Text style={{ paddingLeft: "6px" }}>{ticket.ticket_no}</Text>
                  <Box style={{ width: "50%" }}></Box>
                  <Text>{formatCreatedTime(ticket.createdtime)}</Text>
                </Box>
                <Box
                  flexDirection="row"
                  alignContent="center"
                  justifyContent="space-between"
                >
                  <Box mt={1} flexDirection="row" alignContent="center">
                    <Icon icon="zi-star" />
                    <Text
                      style={{
                        fontSize: "16px",
                        paddingLeft: "6px",
                      }}
                    >
                      {ticket.starred}
                    </Text>
                  </Box>
                  <Box
                    className="status"
                    mt={1}
                    flexDirection="row"
                    alignContent="center"
                    justifyContent="center"
                    style={{
                      backgroundColor: statusColors[ticket.status],
                      display: "inline-block",
                      minWidth: "20%",
                      textAlign: "center",
                      padding: "4px 20px",
                      marginRight: "16px",
                      borderRadius: "16px",
                    }}
                  >
                    <Text style={{ color: statusTextColors[ticket.status] }}>
                      {translationStatus[ticket.status]}
                    </Text>
                  </Box>
                </Box>
              </Box>
              <Box className="list-container" height={4}></Box>
            </Box>
          ))}
          <Button
            variant="tertiary"
            style={{ alignContent: "center" }}
            onClick={handleShowAllTickets}
            disabled={isLoading}
          >
            {isLoading
              ? "Loading..."
              : showAllTickets
              ? "Ẩn bớt"
              : "Hiển thị thêm"}
            <Icon
              icon={showAllTickets ? "zi-chevron-up" : "zi-chevron-down"}
              size={25}
            />
          </Button>
          <Box height={50}></Box>
        </Tabs.Tab>
      </Tabs>
      <Modal
        visible={confirmModalVisible}
        title="CloudTICKET"
        description="Bạn có chắc muốn rời mini app không?"
        actions={[
          {
            text: "Ở lại Mini App",
            onClick: () => {
              setConfirmModalVisible(false);
            },
            highLight: true,
          },
          {
            text: "Rời khỏi",
            onClick: () => {
              closeApp();
              Logout();
            },
          },
        ]}
      />
    </Page>
  );
};

export default HomePage;

const statusColors = {
  Open: "rgba(235, 244, 255, 1)",
  Closed: "rgba(230, 250, 237, 1)",
  "Wait For Verifying": "rgba(235, 244, 255, 1)",
  "Wait For Response": "rgba(235, 244, 255, 1)",
  "Customer Confirmed": "rgba(235, 244, 255, 1)",
  Pending: "rgba(244, 245, 246, 1)",
  Testing: "rgba(230, 250, 237, 1)",
  "In Progress": "rgba(239, 234, 251, 1)",
  Assigned: "rgba(235, 244, 255, 1)",
  Reopen: "rgba(244,245,246, 1)",
  "Wait Close": "rgba(230, 250, 237, 1)",
  Cancel: "rgba(244, 245, 246, 1)",
};

const statusTextColors = {
  Open: "rgba(0, 106, 245, 1)",
  Closed: "rgba(52, 183, 100, 1)",
  "In Progress": "blue",
  "Wait For Verifying": "rgba(0, 106, 245, 1)",
  "Wait For Response": "rgba(0, 106, 245, 1)",
  Pending: "rgba(118, 122, 127, 1)",
  Testing: "rgba(52, 183, 100, 1)",
  "Customer Confirmed": "rgba(0, 106, 245, 1)",
  Assigned: "rgba(106, 64, 191, 1)",
  Reopen: "rgba(118, 122, 127, 1)",
  "Wait Close": "rgba(52, 183, 100, 1)",
  Cancel: "rgba(118, 122, 127, 1)",
};

const translationStatus = {
  Open: "Mới",
  Closed: "Đã đóng",
  "Wait For Verifying": "Chờ xác minh",
  "Wait For Response": "Chờ phản hồi",
  Testing: "Testing",
  Pending: "Tạm hoãn",
  "In Progress": "Đang tiến hành",
  Assigned: "Đã phân công",
  Reopen: "Mở lại",
  "Wait Close": "Đã xong, chờ đóng",
  Cancel: "Hủy",
  "Customer Confirmed": "KH đã xác nhận",
};
