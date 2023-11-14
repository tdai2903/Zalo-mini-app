import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Text, List, Input, Page, Icon, Modal, Button } from "zmp-ui";
import { TicketType } from "../type";
import {
  onConfirmToExit,
  offConfirmToExit,
  setNavigationBarLeftButton,
  closeApp,
  configAppView,
} from "zmp-sdk/apis";
import url_api from "../service";
const SearchPage: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [res, setRes] = useState<TicketType[]>([]);
  const [searchResults, setSearchResults] = useState<TicketType[]>([]);
  const contactData = JSON.parse(localStorage.getItem("contact") || "{}");
  const token = localStorage.getItem("token");
  const [isSearching, setIsSearching] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  // const [showAllTickets, setShowAllTickets] = useState(false);
  const [visibleTicketsCount, setVisibleTicketsCount] = useState(20);

  // const handleShowAllTickets = () => {
  //   if (isSearching) {
  //     if (!showAllTickets) {
  //       setIsLoading(true);
  //       setTimeout(() => {
  //         const newVisibleCount = visibleTicketsCount + 20;
  //         setVisibleTicketsCount(newVisibleCount);
  //         setIsLoading(false);
  //       }, 2000);
  //     } else {
  //       setVisibleTicketsCount(20);
  //     }
  //     setShowAllTickets(!showAllTickets);
  //   }
  // };

  const formatCreatedTime = (createdTime: string) => {
    const date = new Date(createdTime);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const configView = async () => {
    try {
      await configAppView({
        headerColor: "#006AF5",
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
          url_api,
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
                max_results: 100,
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
          console.log("Danh sách ticket:", response.data.data.entry_list);
          const json = response.data.data.entry_list;

          // Lọc danh sách ticket theo contact_id
          const filteredTickets = json.filter((ticket) => {
            return ticket.contact_id === contactData.data.id;
          });

          setRes(filteredTickets);
        });
    } catch (error) {
      if (error === "SyntaxError: Unexpected token T in JSON at position 0") {
        navigate("/");
      } else {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    configView();
    fetchTickets();
    onConfirmToExit(() => setConfirmModalVisible(true));
    return () => offConfirmToExit();
  }, [confirmModalVisible]);

  const handleSearchInputChange = (e) => {
    const inputText = e.target.value;
    setSearchText(inputText);
  };

  const filterTickets = () => {
    const filteredTickets = res.filter((ticket) => {
      const ticketTitle = ticket.title.toLowerCase();
      const ticketNo = ticket.ticket_no.toLowerCase();
      const ticketStatus = translationStatus[ticket.status].toLowerCase();
      const ticketCategory = translationStatus[ticket.category].toLowerCase();
      const searchInput = searchText.toLowerCase();

      if (
        ticketTitle.includes(searchInput) ||
        ticketNo.includes(searchInput) ||
        ticketStatus.includes(searchInput) ||
        ticketCategory.includes(searchInput)
      ) {
        return true;
      }
      return false;
    });

    // Sort the filtered tickets by created time in descending order
    const sortedTickets = filteredTickets.sort(
      (a, b) =>
        new Date(b.createdtime).getTime() - new Date(a.createdtime).getTime()
    );

    // Take the latest 20 tickets
    setSearchResults(sortedTickets.slice(0, 20));
  };

  useEffect(() => {
    filterTickets();
  }, [searchText, res]);

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
    Feedback: "Góp ý",
    Bug: "Báo lỗi",
  };

  return (
    <Page
      className="section-page"
      hideScrollbar={true}
      // restoreScrollOnBack={false}
    >
      <Box
        className="detail-container"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Box
          flexDirection="row"
          alignContent="center"
          justifyContent="space-between"
          style={{
            width: "100%",
          }}
        >
          <Input.Search
            style={{
              borderRadius: "8px",
              border: "1px rgba(185, 189, 193, 1) solid ",
              width: "97%",
              height: "40px",
              backgroundColor: "rgba(244, 245, 246, 1)",
            }}
            type="text"
            size="small"
            focused={true}
            placeholder="Tìm ticket theo tên, mã, trạng thái"
            clearable={{
              mode: "always",
            }}
            value={searchText}
            onChange={handleSearchInputChange}
          />
        </Box>
        <Box>
          <Text
            style={{ cursor: "pointer", width: "5%" }}
            onClick={() => {
              navigate(-1);
            }}
          >
            Thoát
          </Text>
        </Box>
      </Box>
      {searchText !== "" ? (
        <Box className="bgr-color">
          <List>
            {searchResults.slice(0, visibleTicketsCount).map((ticket) => (
              <Box key={ticket.ticketid} style={{ cursor: "pointer" }}>
                <Box
                  mt={1}
                  className="title-detail-container"
                  onClick={() => {
                    navigate(`/detail_ticket/${ticket.ticketid}`, {
                      state: { ...ticket },
                    });
                  }}
                >
                  <Box
                    flexDirection="row"
                    alignContent="center"
                    justifyContent="space-between"
                  >
                    <Text
                      style={{
                        width: "95%",
                        color: "rgba(20, 20, 21, 1)",
                        fontWeight: 500,
                        whiteSpace: "normal", // Đặt về "normal" để cho phép ngắt dòng tự động
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 2, // Hiển thị tối đa 2 dòng
                        overflow: "hidden",
                      }}
                    >
                      [{translationStatus[ticket.category]}] {ticket.title}
                    </Text>
                    {ticket.starred === "1" ? (
                      <div
                        style={{
                          color: "rgba(220, 31, 24, 1)",
                        }}
                        onClick={() => {
                          const updatedTicket = { ...ticket, starred: "0" };
                          setRes((prevRes) =>
                            prevRes.map((t) =>
                              t.ticketid === ticket.ticketid ? updatedTicket : t
                            )
                          );
                        }}
                      >
                        <Icon size={20} icon="zi-heart-solid">
                          {ticket.starred}
                        </Icon>
                      </div>
                    ) : (
                      <div
                        style={{
                          color: "rgba(118, 122, 127, 1)",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          const updatedTicket = { ...ticket, starred: "1" };
                          setRes((prevRes) =>
                            prevRes.map((t) =>
                              t.ticketid === ticket.ticketid ? updatedTicket : t
                            )
                          );
                        }}
                      >
                        <Icon size={20} icon="zi-heart">
                          {ticket.starred}
                        </Icon>
                      </div>
                    )}
                  </Box>
                  <Box
                    mt={1}
                    flexDirection="row"
                    alignContent="center"
                    justifyContent="space-between"
                  >
                    <Box
                      flexDirection="row"
                      alignContent="center"
                      alignItems="center"
                    >
                      <Icon
                        size={20}
                        icon="zi-more-grid"
                        style={{ color: "rgba(118, 122, 127, 1)" }}
                      ></Icon>
                      <Text
                        style={{
                          paddingLeft: "6px",
                          color: "rgba(118, 122, 127, 1)",
                        }}
                      >
                        {ticket.ticket_no}
                      </Text>
                    </Box>
                    <Text
                      style={{
                        color: "rgba(118, 122, 127, 1)",
                      }}
                    >
                      {formatCreatedTime(ticket.createdtime)}
                    </Text>
                  </Box>
                  <Box
                    flexDirection="row"
                    alignContent="center"
                    justifyContent="space-between"
                  >
                    <Box mt={1} flexDirection="row" alignContent="center">
                      <Icon
                        size={20}
                        style={{ color: "rgba(118, 122, 127, 1)" }}
                        icon="zi-star"
                      />
                      <Text
                        style={{
                          paddingLeft: "6px",
                          color: "rgba(118, 122, 127, 1)",
                        }}
                      >
                        {ticket.helpdesk_rating || 0}
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
                        height: "25px",
                        paddingLeft: "16px",
                        paddingRight: "16px",
                        textAlign: "center",
                        borderRadius: "16px",
                      }}
                    >
                      <Text
                        style={{
                          color: statusTextColors[ticket.status],
                          fontSize: "14px",
                          lineHeight: "25px",
                        }}
                      >
                        {translationStatus[ticket.status]}
                      </Text>
                    </Box>
                  </Box>
                </Box>
                <Box className="list-container" height={4}></Box>
              </Box>
            ))}
          </List>
        </Box>
      ) : null}

      {/* <Button
        variant="tertiary"
        style={{ alignContent: "center" }}
        onClick={handleShowAllTickets}
        disabled={isLoading}
      >
        {isLoading ? "Loading..." : showAllTickets ? "Ẩn bớt" : "Hiển thị thêm"}
        <Icon
          icon={showAllTickets ? "zi-chevron-up" : "zi-chevron-down"}
          size={25}
        />
      </Button> */}
      <Modal visible={confirmModalVisible}>
        <img
          style={{
            width: "100px",
            height: "100px",
            display: "block",
            margin: "0 auto",
          }}
          src="https://clipart-library.com/images/gTe5bLznc.gif"
        />

        <Text
          style={{
            fontWeight: 500,
            fontSize: "24px",
            textAlign: "center",
            paddingTop: "24px",
            paddingBottom: "16px",
          }}
        >
          My CloudGO
        </Text>
        <Text
          style={{
            fontWeight: 500,
            color: "rgba(118, 122, 127, 1)",
            paddingBottom: "32px",
          }}
        >
          Bạn có chắc chắn rời khỏi Mini App không?
        </Text>
        <Box
          flex
          flexDirection="row"
          justifyContent="center"
          alignContent="center"
        >
          <Button
            variant="tertiary"
            style={{
              padding: "8px",
              width: "45%",
              borderRadius: "8px",
              border: "1px rgba(0, 106, 245, 1) solid ",
            }}
            size="medium"
            onClick={() => {
              closeApp();
            }}
          >
            Rời khỏi
          </Button>
          <Box width={5} height={1}></Box>
          <Button
            style={{
              padding: "8px",
              width: "45%",
              borderRadius: "8px",
            }}
            size="medium"
            onClick={() => {
              setConfirmModalVisible(false);
              offConfirmToExit();
            }}
          >
            Ở lại Mini App
          </Button>
        </Box>
      </Modal>
    </Page>
  );
};

export default SearchPage;
