import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Text, List, Input, Page, Icon } from "zmp-ui";
import { TicketType } from "../type";

const SearchPage: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [res, setRes] = useState<TicketType[]>([]);
  const [searchResults, setSearchResults] = useState<TicketType[]>([]);
  const token = localStorage.getItem("token");
  const [isSearching, setIsSearching] = useState(true);

  const formatCreatedTime = (createdTime: string) => {
    const date = new Date(createdTime);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getTickets = async () => {
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

  useEffect(() => {
    getTickets();
  }, []);

  const filterTickets = () => {
    const filteredTickets = res.filter((ticket) => {
      const ticketTitle = ticket.title.toLowerCase();
      const ticketNo = ticket.ticket_no.toLowerCase();
      const searchInput = searchText.toLowerCase();
      return (
        ticketTitle.includes(searchInput) || ticketNo.includes(searchInput)
      );
    });
    setSearchResults(filteredTickets);
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
  };

  return (
    <Page className="bgr-color" hideScrollbar={true}>
      <Box
        pt={2}
        pl={4}
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Box
          flexDirection="row"
          alignContent="center"
          justifyContent="space-between"
        >
          <Input.Search
            style={{
              backgroundColor: "rgba(244, 245, 246, 1)",
              borderRadius: "10px",
              border: "0.1px solid #ccc",
              fontSize: "16px",
              height: "34px",
              width: "290px",
            }}
            type="text"
            placeholder="Tìm nhanh ticket"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Box>
        <Text
          bold
          size="xLarge"
          style={{ cursor: "pointer", marginRight: "12px" }}
          onClick={() => {
            setIsSearching(false);
            navigate(-1);
          }}
        >
          Thoát
        </Text>
      </Box>

      <Box pt={3} className="bgr-color">
        <List>
          {searchResults.map((ticket) => (
            <Box key={ticket.ticketid}>
              <Box
                mt={1}
                className="section-container"
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
                    bold
                    size="xLarge"
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      paddingRight: "6px",
                    }}
                  >
                    {ticket.title}
                  </Text>
                  <Icon icon="zi-heart" />
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
                      5{ticket.rating || ""}
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
        </List>
      </Box>
    </Page>
  );
};

export default SearchPage;
