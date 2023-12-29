import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Text, List, Input, Page, Icon } from "zmp-ui";
import { TicketType } from "../type";
import { configAppView } from "zmp-sdk/apis";
import url_api from "../service";
import TicketItem from "../items/ticket_items";
const SearchTicketCompanyPage: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [res, setRes] = useState<TicketType[]>([]);
  const [searchResults, setSearchResults] = useState<TicketType[]>([]);
  const contactData = JSON.parse(localStorage.getItem("contact") || "{}");
  const token = localStorage.getItem("token");
  const [visibleTicketsCount, setVisibleTicketsCount] = useState(20);

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
                parent_id: contactData.data?.account_id,
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
          const json = response.data.data.entry_list;
          console.log("Danh sách ticket của công ty:", json);
          setRes(json);
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
  }, []);

  const handleSearchInputChange = (e) => {
    const inputText = e.target.value;
    setSearchText(inputText);
  };

  const filterTickets = () => {
    const filteredTickets = res.filter((ticket) => {
      const ticketTitle = ticket.title.toLowerCase();
      const ticketNo = ticket.ticket_no.toLowerCase();
      const ticketStatus =
        translationStatus[ticket.status]?.toLowerCase() || ""; // Use optional chaining and provide a default value
      const ticketCategory =
        translationStatus[ticket.category]?.toLowerCase() || ""; // Use optional chaining and provide a default value
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
    "Wait Close": "Đã xong (chờ đóng)",
    Cancel: "Hủy",
    "Customer Confirmed": "KH đã xác nhận",
    Feedback: "Góp ý",
    Bug: "Báo lỗi",
    Other: "Khác",
  };

  return (
    <Page className="section-page" hideScrollbar={true} resetScroll={false}>
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
              <TicketItem
                key={ticket.ticketid}
                ticket={ticket}
                translationStatus={translationStatus}
                statusColors={statusColors}
                statusTextColors={statusTextColors}
                formatCreatedTime={formatCreatedTime}
                navigate={navigate}
                setRes={setRes}
              />
            ))}
          </List>
        </Box>
      ) : null}
    </Page>
  );
};

export default SearchTicketCompanyPage;
