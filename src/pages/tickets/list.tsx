import React, { useEffect, useState } from "react";
import {
  Page,
  Icon,
  useNavigate,
  Box,
  Text,
  Input,
  Tabs,
  Button,
  Sheet,
  DatePicker,
} from "zmp-ui";
import { TicketType } from "../../type";
import imgEmpty from "/assets-src/ticketEmpty.png";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import PullToRefresh from "react-simple-pull-to-refresh";
import { useRecoilState } from "recoil";
import {
  allTicketState,
  cancelTicketState,
  closedTicketState,
  followTicketState,
  offsetState,
  openTicketState,
  processTicketState,
  resState,
} from "../../states_recoil/states_recoil";
import TicketItem from "../../components/ticket";
import TicketEmpty from "../../components/ticket_empty";
import { useService } from "../../functions/common";
const TicketsListPage: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const [allTickets, setAllTickets] = useRecoilState(allTicketState); // global state tất cả ticket
  const [followTicketMe, setFollowTicketMe] = useRecoilState(followTicketState);
  const [openTicketsMe, setOpenTicketsMe] = useRecoilState(openTicketState); // global state ticket có status = Open
  const [processTicketsMe, setProcessTicketsMe] =
    useRecoilState(processTicketState); // global state ticket có status = In Progress | Customer Confirmed | Assigned | Wait Close
  const [closedTicketsMe, setClosedTicketsMe] =
    useRecoilState(closedTicketState); // global state ticket có status = Closed
  const [cancelTicketsMe, setCancelTicketsMe] =
    useRecoilState(cancelTicketState); // global state ticket có status = Cancel
  const [res, setRes] = useRecoilState(resState); // global state danh sách ticket từ data api get list ticket
  const [ticketByCompany, setTicketByCompany] = useState<TicketType[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false); // set state cho handleRefresh app
  const [isLoading, setIsLoading] = useState(false); // state loading app
  const [filtered, setFiltered] = useState(""); // set state value truyền vào khi filter theo today | thisWeek | thisMonth
  const [loading, setLoading] = useState(false); // set state loading danh sách ticket
  const contactData = JSON.parse(localStorage.getItem("profile") || "{}"); // get profile từ localStorage
  const [sheetVisible, setSheetVisible] = useState(false); // state hiển thị sheet khi filter theo custom
  const [loadingFilter, setLoadingFilter] = useState(false); //state loading khi filter
  const [sortedAndFilteredTicketsBackup, setSortedAndFilteredTicketsBackup] =
    useState<TicketType[]>([]); // state chứa danh sách ticket tạm thời khi filter
  const [customDateVisible, setCustomDateVisible] = useState(false); // state check filter có đang ở dạng custom date hay không?
  const [startDate, setStartDate] = useState<Date | null>(null); // state check start date khi filter theo ngày đầu tiên
  const [endDate, setEndDate] = useState<Date | null>(null); // state check end date khi filter đến ngày kết thúc
  const [selectedButton, setSelectedButton] = useState(""); // state check button đang chọn ở filter
  const [followTickets, setFollowTickets] = useState<TicketType[]>([]); // state check những ticket đang được follow
  const [inProgressTickets, setInProgressTickets] = useState<TicketType[]>([]);
  const [totalTicketCompany, setTotalTicketCompany] = useState<number>(0);
  const [totalfollowTickets, setTotalFollowTickets] = useState<number>(0);
  const [loadingMore, setLoadingMore] = useState(false); // state check loadingmore khi scroll loading
  const [allTicketsLoaded, setAllTicketsLoaded] = useState(false); // state check nếu allTicketsLoaded thì tắt loading danh sách ticket
  const [currentTab, setCurrentTab] = useState("tab1"); // state set currentTab ở tab ticket của tôi
  const [currentTabCompany, setCurrentTabCompany] = useState("all"); // state set currentTab ở tab ticket công ty
  const [tabParent, setTabParent] = useState("forme"); // state set currentTab là tab của tôi
  const [offset, setOffset] = useRecoilState(offsetState);
  const { fetchTickets, configView, setLeftButton, followTicket } =
    useService(); // import sử dụng các functions ở file common.ts

  // chạy useEffect này đầu tiên để set lại state và config header
  useEffect(() => {
    configView("My CloudGO", "none");
    setLeftButton("none");
    fetchTickets("tab1", "", "0", contactData.data?.id, "", []);
    fetchTickets("all", "", "0", contactData.data?.account_id, "", []);
  }, [loading]);

  /**
   * hàm gọi api get ticket của tôi khi click theo từng tab
   * @param tabkey | ticketStatus
   */
  const handleTabClick = (tabkey) => {
    // Thực hiện logic cần thiết trước khi gọi fetchTickets
    const contactId = contactData.data?.id;
    let ticketStatus: string[] = [];
    let starred = "0";
    switch (tabkey) {
      case "tab1":
        ticketStatus = [
          "Open",
          "Wait For Response",
          "Closed",
          "Customer Confirmed",
          "Assigned",
          "Wait For Verifying",
          "In Progress",
          "Wait Close",
          "Testing",
          "Pending",
          "Reopen",
          "Sent Confirm Email",
        ];
        starred = "0";

        break;
      case "tab2":
        ticketStatus = ["Open"];
        starred = "1";
        break;
      case "tab3":
        ticketStatus = ["Open"];
        starred = "0";
        break;
      case "tab4":
        ticketStatus = [
          "Customer Confirmed",
          "Assigned",
          "In Progress",
          "Wait Close",
        ];
        starred = "0";

        break;
      case "tab5":
        ticketStatus = ["Closed"];
        starred = "0";

        break;

      case "tab6":
        ticketStatus = ["Cancel"];
        starred = "0";

        break;
      // Các case khác nếu có
      default:
        break;
    }

    // Gọi hàm fetchTickets với các tham số đã xác định
    fetchTickets(tabkey, "", starred, contactId, "", ticketStatus);
  };

  /**
   * hàm gọi api get ticket của công ty khi click theo từng tab
   * @param tabKeyCompany | ticketStatus
   */
  const handleTicketByCompany = (tabKeyCompany) => {
    if (contactData.data?.account_id === "0") {
      // Nếu account_id là 0, không gọi hàm
      console.log("account_id là 0, không thực hiện gọi TicketByCompany");
      return;
    }
    const account_id = contactData.data?.account_id;
    let ticketStatus: string[] = [];

    switch (tabKeyCompany) {
      case "all":
        ticketStatus = [
          "Open",
          "Wait For Response",
          "Closed",
          "Wait For Verifying",
          "Customer Confirmed",
          "Assigned",
          "In Progress",
          "Wait Close",
          "Testing",
          "Pending",
          "Reopen",
          "Sent Confirm Email",
        ];
        break;
      case "open":
        ticketStatus = ["Open"];
        break;
      case "process":
        ticketStatus = [
          "Customer Confirmed",
          "Assigned",
          "In Progress",
          "Wait Close",
        ];
        break;
      case "done":
        ticketStatus = ["Closed"];
        break;
      case "cancel":
        ticketStatus = ["Cancel"];
        break;
      // Các case khác nếu có
      default:
        break;
    }

    // Gọi hàm TicketByCompany với các tham số đã xác định
    fetchTickets(tabKeyCompany, "", "", "", account_id, ticketStatus);
  };

  // filter ticket theo date time
  const sortTickets = (sortBy) => {
    let filteredAndSorted = [...sortedAndFilteredTicketsBackup];

    if (sortBy === "today") {
      const today = new Date();
      const startOfToday = startOfDay(today).getTime();
      const endOfToday = endOfDay(today).getTime();
      setFiltered("today");
      filteredAndSorted = filteredAndSorted.filter((ticket) => {
        const ticketTime = new Date(ticket.createdtime).getTime();
        return ticketTime >= startOfToday && ticketTime <= endOfToday;
      });
    } else if (sortBy === "thisWeek") {
      const startOfWeekDate = startOfWeek(new Date()).getTime();
      const endOfWeekDate = endOfWeek(new Date()).getTime();
      setFiltered("thisWeek");

      filteredAndSorted = filteredAndSorted.filter((ticket) => {
        const ticketTime = new Date(ticket.createdtime).getTime();
        return ticketTime >= startOfWeekDate && ticketTime <= endOfWeekDate;
      });
    } else if (sortBy === "thisMonth") {
      const startOfMonthDate = startOfMonth(new Date()).getTime();
      const endOfMonthDate = endOfMonth(new Date()).getTime();
      setFiltered("thisMonth");

      filteredAndSorted = filteredAndSorted.filter((ticket) => {
        const ticketTime = new Date(ticket.createdtime).getTime();
        return ticketTime >= startOfMonthDate && ticketTime <= endOfMonthDate;
      });
    }
  };

  // hàm format date time
  function formatCreatedTime(createdTime) {
    const date = new Date(createdTime);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return createdTime.substring(0, 11);
  }

  // hàm show more ticket khi scroll
  const handleShowAllTickets = () => {
    setIsLoading(true);
    setLoadingMore(true);

    setTimeout(() => {
      fetchTickets("", "", "", contactData.data?.id, "", []);
      setIsLoading(false);
      setLoadingMore(false);
    }, 2000);
  };

  // hàm scroll
  const handleScroll = () => {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight &&
      !loadingMore
    ) {
      handleShowAllTickets();
    }
  };

  // hàm Reload lại api get ticket
  const handleReload = () => {
    fetchTickets("", "", "", contactData.data?.id, "", []);
    fetchTickets("", "", "", "", contactData.data?.account_id, []);
  };

  // hàm reFresh app
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setLoading(true);
    setTimeout(() => {
      handleReload();
      setIsRefreshing(false);
      setLoading(false);
    }, 1500);
  };

  /**
   * hàm truyền value khi click vào button trong filter
   * @param buttonName : today | thisWeek | thisMonth
   */
  const handleCustomDateClick = (buttonName) => {
    setCustomDateVisible(true);
    setSelectedButton(buttonName);
  };

  /**
   * hàm filter ticket theo dạng custom date
   */
  const handleOtherButtonClick = (buttonValue) => {
    sortTickets(buttonValue);
    setSelectedButton(buttonValue);
    setSheetVisible(false);
    setCustomDateVisible(false);
    setLoadingFilter(true);
    setTimeout(() => {
      setLoadingFilter(false);
    }, 1500);
  };

  // hàm filter theo custom date từ DD/MM/YY => DD/MM/YY
  const handlePickder = () => {
    const filteredTickets = sortedAndFilteredTicketsBackup.filter((ticket) => {
      const ticketTime = new Date(ticket.createdtime).getTime();
      return startDate && endDate
        ? ticketTime >= startOfDay(startDate).getTime() &&
            ticketTime <= endOfDay(endDate).getTime()
        : true;
    });
  };

  // hàm confirm filter khi filter theo dạng custom date
  const handleConfirmButtonFilter = () => {
    // Kiểm tra xem startDate và endDate có tồn tại
    if (startDate && endDate) {
      handlePickder();
      setCustomDateVisible(false);
      setLoadingFilter(true);
      setSheetVisible(false);
      setCustomDateVisible(false);
      setTimeout(() => {
        setLoadingFilter(false);
      }, 2000);
    } else {
      // Hiển thị thông báo hoặc thực hiện một hành động khác khi startDate và endDate không tồn tại
      console.error("Vui lòng chọn ngày bắt đầu và ngày kết thúc.");
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      setIsLoading(false);
      clearTimeout(delay);
    }, 2000);

    // Cleanup function
    return () => clearTimeout(delay);
  }, []);

  const getFollowTicketsCount = () => {
    return ticketByCompany.filter((ticket) => ticket.starred === "1").length;
  };

  const getStatusTicketsCount = ticketByCompany.filter(
    (ticket) =>
      ticket.status === "Open" ||
      ticket.status === "Wait For Verifying" ||
      ticket.status === "Reopen"
  ).length;

  const getInProgressTicketsCount = ticketByCompany.filter(
    (ticket) =>
      ticket.status === "Customer Confirmed" ||
      ticket.status === "Assigned" ||
      ticket.status === "In Progress" ||
      ticket.status === "Wait Close"
  ).length;

  const getDoneTicket = ticketByCompany.filter(
    (ticket) => ticket.status === "Closed"
  ).length;

  const getCancelTicket = ticketByCompany.filter(
    (ticket) => ticket.status === "Cancel"
  ).length;

  return (
    <PullToRefresh onRefresh={handleRefresh} refreshingContent="">
      <Page
        hideScrollbar={true}
        restoreScrollOnBack={false}
        className="section-page"
        onScroll={handleScroll}
      >
        {loading && (
          <Box
            flex
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(239, 239, 239, 0.92)",
              zIndex: 9999,
            }}
          >
            <FontAwesomeIcon
              size="3x"
              icon={faSpinner}
              spin
              color="rgba(0, 106, 245, 1)"
            />
          </Box>
        )}

        <Tabs
          activeKey={tabParent}
          defaultActiveKey="forme"
          onTabClick={(key) => setTabParent(key)}
        >
          <Tabs.Tab
            key="forme"
            label={
              <Box
                width={180}
                className="tab-container"
                style={{
                  backgroundColor:
                    tabParent === "forme"
                      ? "rgba(0, 106, 245, 1)"
                      : "rgba(244, 245, 246, 1)",
                }}
              >
                <Text
                  style={{
                    color: tabParent === "forme" ? "white" : "black",
                    fontWeight: 500,
                    textAlign: "center",
                  }}
                >
                  Của tôi
                </Text>
              </Box>
            }
          >
            <Box
              mt={2}
              flexDirection="row"
              justifyContent="space-between"
              className="detail-container"
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
                  size="small"
                  style={{
                    border: "1px rgba(185, 189, 193, 1) solid ",
                    width: "98%",
                    height: "40px",
                    borderRadius: "4px",
                  }}
                  type="text"
                  placeholder="Tìm ticket theo tên, mã, trạng thái"
                  onClick={() => {
                    navigate(`/tickets/search`);
                  }}
                />
              </Box>

              <Box
                style={{
                  width: "7%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={() => {
                  setSheetVisible(true);
                }}
              >
                <Icon
                  size={24}
                  icon={"zi-filter"}
                  style={{
                    color: "rgba(118, 122, 127, 1)",
                  }}
                />
              </Box>
              <Sheet
                visible={sheetVisible}
                onClose={() => setSheetVisible(false)}
                autoHeight
                mask
                handler
                swipeToClose
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: "18px",
                    fontWeight: 500,
                    paddingTop: "4px",
                  }}
                >
                  {" Bộ lọc "}
                </Text>

                <Box m={4} flexDirection="column">
                  <Button
                    variant="tertiary"
                    style={{
                      borderRadius: "8px",
                      color:
                        selectedButton === "today"
                          ? "rgba(0, 106, 245, 1)"
                          : "rgba(118, 122, 127, 1)",
                    }}
                    onClick={() => handleOtherButtonClick("today")}
                  >
                    Hôm nay
                  </Button>
                  <Button
                    variant="tertiary"
                    style={{
                      borderRadius: "8px",
                      color:
                        selectedButton === "thisWeek"
                          ? "rgba(0, 106, 245, 1)"
                          : "rgba(118, 122, 127, 1)",
                    }}
                    onClick={() => handleOtherButtonClick("thisWeek")}
                  >
                    Tuần này
                  </Button>
                  <Button
                    variant="tertiary"
                    style={{
                      borderRadius: "8px",
                      color:
                        selectedButton === "thisMonth"
                          ? "rgba(0, 106, 245, 1)"
                          : "rgba(118, 122, 127, 1)",
                    }}
                    onClick={() => handleOtherButtonClick("thisMonth")}
                  >
                    Tháng này
                  </Button>
                  <Button
                    variant="tertiary"
                    style={{
                      borderRadius: "8px",
                      color:
                        selectedButton === "custom"
                          ? "rgba(0, 106, 245, 1)"
                          : "rgba(118, 122, 127, 1)",
                    }}
                    onClick={() => handleCustomDateClick("custom")}
                  >
                    Tùy chỉnh
                  </Button>
                  {selectedButton === "custom" && customDateVisible && (
                    <Box flexDirection="row" textAlign="center">
                      <DatePicker
                        mask
                        maskClosable
                        dateFormat="dd/mm/yyyy"
                        title="Chọn ngày"
                        value={startDate}
                        onChange={(date) => setStartDate(date)}
                      />
                      <Box width={16}></Box>
                      <DatePicker
                        mask
                        maskClosable
                        dateFormat="dd/mm/yyyy"
                        title="Chọn ngày"
                        value={endDate}
                        onChange={(date) => setEndDate(date)}
                      />
                    </Box>
                  )}

                  <Button
                    size="small"
                    style={{ marginTop: "8px" }}
                    onClick={handleConfirmButtonFilter}
                  >
                    Chọn
                  </Button>
                  <Box height={60} />
                </Box>
              </Sheet>
            </Box>
            <Tabs
              activeKey={currentTab}
              defaultActiveKey="tab1"
              onTabClick={(tabKey) => {
                setCurrentTab(tabKey);
                handleTabClick(tabKey);
              }}
              scrollable={true}
            >
              <Tabs.Tab
                key="tab1"
                label={
                  <Text
                    style={{
                      textAlign: "center",
                      fontWeight: currentTab === "tab1" ? 500 : 400,
                      color:
                        currentTab === "tab1"
                          ? "rgba(18, 144, 255, 1)"
                          : "rgba(118, 122, 127, 1)",
                    }}
                  >
                    {currentTab === "tab1" ? `Tất cả` : "Tất cả"} (
                    {allTickets.paging.total_count > 99
                      ? "99+"
                      : allTickets.paging.total_count}
                    )
                  </Text>
                }
                style={{ flex: 1 }}
              >
                {allTickets.paging.total_count === 0 ||
                allTickets.paging.total_count == 0 ? (
                  // Component hiển thị ticket đang trống
                  <TicketEmpty />
                ) : loadingFilter ? (
                  <Box className="center-spinner">
                    <FontAwesomeIcon
                      size="2x"
                      icon={faSpinner}
                      spin
                      color="rgba(0, 106, 245, 1)"
                    />
                  </Box>
                ) : (
                  allTickets.entry_list.map((ticket) => (
                    <TicketItem
                      key={ticket.ticketid}
                      ticket={ticket}
                      translationStatus={translationStatus}
                      statusColors={statusColors}
                      statusTextColors={statusTextColors}
                      formatCreatedTime={formatCreatedTime}
                      navigate={navigate}
                      followTicket={followTicket}
                      setRes={setRes}
                    />
                  ))
                )}
                {isLoading && !allTicketsLoaded && (
                  <Box className="center-spinner">
                    <FontAwesomeIcon
                      size="2x"
                      icon={faSpinner}
                      spin
                      color="rgba(0, 106, 245, 1)"
                    />
                  </Box>
                )}
                <Box height={120}></Box>
              </Tabs.Tab>
              <Tabs.Tab
                key="tab2"
                label={
                  <Text
                    style={{
                      textAlign: "center",
                      fontWeight: currentTab === "tab2" ? 500 : 400,
                      color:
                        currentTab === "tab2"
                          ? "rgba(18, 144, 255, 1)"
                          : "rgba(118, 122, 127, 1)",
                    }}
                  >
                    {currentTab === "tab2" ? `Theo dõi` : "Theo dõi"} (
                    {followTicketMe.paging.total_count > 99
                      ? "99+"
                      : followTicketMe.paging.total_count}
                    )
                  </Text>
                }
                style={{ flex: 1 }}
              >
                {followTicketMe.paging.total_count === 0 ? (
                  // Component hiển thị ticket đang trống
                  <TicketEmpty />
                ) : loadingFilter ? (
                  <Box className="center-spinner">
                    <FontAwesomeIcon
                      size="2x"
                      icon={faSpinner}
                      spin
                      color="rgba(0, 106, 245, 1)"
                    />
                  </Box>
                ) : (
                  followTicketMe.entry_list.map((ticket) => (
                    <TicketItem
                      key={ticket.ticketid}
                      ticket={ticket}
                      translationStatus={translationStatus}
                      statusColors={statusColors}
                      statusTextColors={statusTextColors}
                      formatCreatedTime={formatCreatedTime}
                      navigate={navigate}
                      followTicket={followTicket}
                      setRes={setRes}
                    />
                  ))
                )}

                {isLoading && !allTicketsLoaded && (
                  <Box className="center-spinner">
                    <FontAwesomeIcon
                      size="2x"
                      icon={faSpinner}
                      spin
                      color="rgba(0, 106, 245, 1)"
                    />
                  </Box>
                )}
                <Box height={100}></Box>
              </Tabs.Tab>
              <Tabs.Tab
                key="tab3"
                label={
                  <Text
                    style={{
                      textAlign: "center",
                      fontWeight: currentTab === "tab3" ? 500 : 400,
                      color:
                        currentTab === "tab3"
                          ? "rgba(18, 144, 255, 1)"
                          : "rgba(118, 122, 127, 1)",
                    }}
                  >
                    {currentTab === "tab3" ? `Mới` : "Mới"} (
                    {openTicketsMe.paging.total_count > 99
                      ? "99+"
                      : openTicketsMe.paging.total_count}
                    )
                  </Text>
                }
                style={{ flex: 1 }}
              >
                {openTicketsMe.entry_list.length === 0 ? (
                  // Component hiển thị ticket đang trống
                  <TicketEmpty />
                ) : loadingFilter ? (
                  <Box className="center-spinner">
                    <FontAwesomeIcon
                      size="2x"
                      icon={faSpinner}
                      spin
                      color="rgba(0, 106, 245, 1)"
                    />
                  </Box>
                ) : (
                  openTicketsMe?.entry_list.map((ticket) => (
                    <TicketItem
                      key={ticket?.ticketid}
                      ticket={ticket}
                      translationStatus={translationStatus}
                      statusColors={statusColors}
                      statusTextColors={statusTextColors}
                      formatCreatedTime={formatCreatedTime}
                      navigate={navigate}
                      followTicket={followTicket}
                      setRes={setRes}
                    />
                  ))
                )}

                {isLoading && !allTicketsLoaded && (
                  <Box className="center-spinner">
                    <FontAwesomeIcon
                      size="2x"
                      icon={faSpinner}
                      spin
                      color="rgba(0, 106, 245, 1)"
                    />
                  </Box>
                )}
                <Box height={100}></Box>
              </Tabs.Tab>
              <Tabs.Tab
                key="tab4"
                label={
                  <Text
                    style={{
                      textAlign: "center",
                      fontWeight: currentTab === "tab4" ? 500 : 400,
                      color:
                        currentTab === "tab4"
                          ? "rgba(18, 144, 255, 1)"
                          : "rgba(118, 122, 127, 1)",
                    }}
                  >
                    {currentTab === "tab4" ? `Đang xử lý` : "Đang xử lý"} (
                    {processTicketsMe.paging.total_count > 99
                      ? "99+"
                      : processTicketsMe.paging.total_count}
                    )
                  </Text>
                }
                style={{ flex: 1 }}
              >
                {processTicketsMe.paging.total_count === 0 ? (
                  // Component hiển thị ticket đang trống
                  <TicketEmpty />
                ) : loadingFilter ? (
                  <Box className="center-spinner">
                    <FontAwesomeIcon
                      size="2x"
                      icon={faSpinner}
                      spin
                      color="rgba(0, 106, 245, 1)"
                    />
                  </Box>
                ) : (
                  processTicketsMe.entry_list.map((ticket) => (
                    <TicketItem
                      key={ticket.ticketid}
                      ticket={ticket}
                      translationStatus={translationStatus}
                      statusColors={statusColors}
                      statusTextColors={statusTextColors}
                      formatCreatedTime={formatCreatedTime}
                      navigate={navigate}
                      followTicket={followTicket}
                      setRes={setRes}
                    />
                  ))
                )}

                {isLoading && !allTicketsLoaded && (
                  <Box className="center-spinner">
                    <FontAwesomeIcon
                      size="2x"
                      icon={faSpinner}
                      spin
                      color="rgba(0, 106, 245, 1)"
                    />
                  </Box>
                )}
                <Box height={100}></Box>
              </Tabs.Tab>
              <Tabs.Tab
                key="tab5"
                label={
                  <Text
                    style={{
                      textAlign: "center",
                      fontWeight: currentTab === "tab5" ? 500 : 400,
                      color:
                        currentTab === "tab5"
                          ? "rgba(18, 144, 255, 1)"
                          : "rgba(118, 122, 127, 1)",
                    }}
                  >
                    {currentTab === "tab5" ? `Hoàn thành` : "Hoàn thành"} (
                    {closedTicketsMe.paging.total_count > 99
                      ? "99+"
                      : closedTicketsMe.paging.total_count}
                    )
                  </Text>
                }
                style={{ flex: 1 }}
              >
                {closedTicketsMe.paging.total_count === 0 ? (
                  // Component hiển thị ticket đang trống
                  <TicketEmpty />
                ) : loadingFilter ? (
                  <Box className="center-spinner">
                    <FontAwesomeIcon
                      size="2x"
                      icon={faSpinner}
                      spin
                      color="rgba(0, 106, 245, 1)"
                    />
                  </Box>
                ) : (
                  closedTicketsMe.entry_list.map((ticket) => (
                    <TicketItem
                      key={ticket.ticketid}
                      ticket={ticket}
                      translationStatus={translationStatus}
                      statusColors={statusColors}
                      statusTextColors={statusTextColors}
                      formatCreatedTime={formatCreatedTime}
                      navigate={navigate}
                      followTicket={followTicket}
                      setRes={setRes}
                    />
                  ))
                )}

                {isLoading && !allTicketsLoaded && (
                  <Box className="center-spinner">
                    <FontAwesomeIcon
                      size="2x"
                      icon={faSpinner}
                      spin
                      color="rgba(0, 106, 245, 1)"
                    />
                  </Box>
                )}
                <Box height={100}></Box>
              </Tabs.Tab>
              <Tabs.Tab
                key="tab6"
                label={
                  <Text
                    style={{
                      textAlign: "center",
                      fontWeight: currentTab === "tab6" ? 500 : 400,
                      color:
                        currentTab === "tab6"
                          ? "rgba(18, 144, 255, 1)"
                          : "rgba(118, 122, 127, 1)",
                    }}
                  >
                    {currentTab === "tab6" ? `Hủy` : "Hủy"} (
                    {cancelTicketsMe.paging.total_count > 99
                      ? "99+"
                      : cancelTicketsMe.paging.total_count}
                    )
                  </Text>
                }
                style={{ flex: 1 }}
              >
                {cancelTicketsMe.paging.total_count === 0 ? (
                  // Component hiển thị ticket đang trống
                  <TicketEmpty />
                ) : loadingFilter ? (
                  <Box className="center-spinner">
                    <FontAwesomeIcon
                      size="2x"
                      icon={faSpinner}
                      spin
                      color="rgba(0, 106, 245, 1)"
                    />
                  </Box>
                ) : (
                  cancelTicketsMe.entry_list.map((ticket) => (
                    <TicketItem
                      key={ticket.ticketid}
                      ticket={ticket}
                      translationStatus={translationStatus}
                      statusColors={statusColors}
                      statusTextColors={statusTextColors}
                      formatCreatedTime={formatCreatedTime}
                      navigate={navigate}
                      followTicket={followTicket}
                      setRes={setRes}
                    />
                  ))
                )}

                {isLoading && !allTicketsLoaded && (
                  <Box className="center-spinner">
                    <FontAwesomeIcon
                      size="2x"
                      icon={faSpinner}
                      spin
                      color="rgba(0, 106, 245, 1)"
                    />
                  </Box>
                )}

                <Box height={100}></Box>
              </Tabs.Tab>
            </Tabs>
          </Tabs.Tab>
          <Tabs.Tab
            key="company"
            label={
              <Box
                width={180}
                className="tab-container"
                style={{
                  backgroundColor:
                    tabParent === "company"
                      ? "rgba(0, 106, 245, 1)"
                      : "rgba(244, 245, 246, 1)",
                }}
              >
                <Text
                  style={{
                    color: tabParent === "company" ? "white" : "black",
                    fontWeight: 500,
                    textAlign: "center",
                  }}
                >
                  Công ty
                </Text>
              </Box>
            }
          >
            <Box
              mt={2}
              flexDirection="row"
              justifyContent="space-between"
              className="detail-container"
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
                  size="small"
                  style={{
                    border: "1px rgba(185, 189, 193, 1) solid ",
                    width: "98%",
                    height: "40px",
                    borderRadius: "4px",
                  }}
                  type="text"
                  placeholder="Tìm ticket theo tên, mã, trạng thái"
                  onClick={() => {
                    navigate(`/tickets/search`);
                  }}
                />
              </Box>

              <Box
                style={{
                  width: "7%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={() => {
                  setSheetVisible(true);
                }}
              >
                <Icon
                  size={24}
                  icon={"zi-filter"}
                  style={{
                    color: "rgba(118, 122, 127, 1)",
                  }}
                />
              </Box>
              <Sheet
                visible={sheetVisible}
                onClose={() => setSheetVisible(false)}
                autoHeight
                mask
                handler
                swipeToClose
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: "18px",
                    fontWeight: 500,
                    paddingTop: "4px",
                  }}
                >
                  {" Bộ lọc "}
                </Text>

                <Box m={4} flexDirection="column">
                  <Button
                    variant="tertiary"
                    style={{
                      borderRadius: "8px",
                      color:
                        selectedButton === "today"
                          ? "rgba(0, 106, 245, 1)"
                          : "rgba(118, 122, 127, 1)",
                    }}
                    onClick={() => handleOtherButtonClick("today")}
                  >
                    Hôm nay
                  </Button>
                  <Button
                    variant="tertiary"
                    style={{
                      borderRadius: "8px",
                      color:
                        selectedButton === "thisWeek"
                          ? "rgba(0, 106, 245, 1)"
                          : "rgba(118, 122, 127, 1)",
                    }}
                    onClick={() => handleOtherButtonClick("thisWeek")}
                  >
                    Tuần này
                  </Button>
                  <Button
                    variant="tertiary"
                    style={{
                      borderRadius: "8px",
                      color:
                        selectedButton === "thisMonth"
                          ? "rgba(0, 106, 245, 1)"
                          : "rgba(118, 122, 127, 1)",
                    }}
                    onClick={() => handleOtherButtonClick("thisMonth")}
                  >
                    Tháng này
                  </Button>
                  <Button
                    variant="tertiary"
                    style={{
                      borderRadius: "8px",
                      color:
                        selectedButton === "custom"
                          ? "rgba(0, 106, 245, 1)"
                          : "rgba(118, 122, 127, 1)",
                    }}
                    onClick={() => handleCustomDateClick("custom")}
                  >
                    Tùy chỉnh
                  </Button>
                  {selectedButton === "custom" && customDateVisible && (
                    <Box flexDirection="row" textAlign="center">
                      <DatePicker
                        mask
                        maskClosable
                        dateFormat="dd/mm/yyyy"
                        title="Chọn ngày"
                        value={startDate}
                        onChange={(date) => setStartDate(date)}
                      />
                      <Box width={16}></Box>
                      <DatePicker
                        mask
                        maskClosable
                        dateFormat="dd/mm/yyyy"
                        title="Chọn ngày"
                        value={endDate}
                        onChange={(date) => setEndDate(date)}
                      />
                    </Box>
                  )}

                  <Button
                    size="small"
                    style={{ marginTop: "8px" }}
                    onClick={handleConfirmButtonFilter}
                  >
                    Chọn
                  </Button>
                  <Box height={60} />
                </Box>
              </Sheet>
            </Box>
            <Tabs
              activeKey={currentTabCompany}
              defaultActiveKey="all"
              onTabClick={(tabKeyCompany) => {
                setCurrentTabCompany(tabKeyCompany);
                handleTicketByCompany(tabKeyCompany);
              }}
              scrollable={true}
            >
              <Tabs.Tab
                key="all"
                label={
                  <Text
                    style={{
                      textAlign: "center",
                      fontWeight: currentTabCompany === "all" ? 500 : 400,
                      color:
                        currentTabCompany === "all"
                          ? "rgba(18, 144, 255, 1)"
                          : "rgba(118, 122, 127, 1)",
                    }}
                  >
                    {currentTabCompany === "all"
                      ? `Tất cả (${
                          ticketByCompany.length > 99
                            ? "99+"
                            : ticketByCompany.length
                        })`
                      : `Tất cả (${
                          totalTicketCompany > 99 ? "99+" : totalTicketCompany
                        })`}
                  </Text>
                }
                style={{ flex: 1 }}
              >
                {ticketByCompany.length === 0 ? (
                  <Box mt={5} style={{ textAlign: "center" }}>
                    <img
                      src={imgEmpty}
                      alt="iconticket"
                      style={{
                        height: "80px",
                        width: "80px",
                        display: "block",
                        margin: "0 auto",
                      }}
                    />
                    <Text
                      bold
                      style={{ textAlign: "center", paddingTop: "10px" }}
                    >
                      Quý khách chưa có lịch sử ticket nào
                    </Text>
                  </Box>
                ) : loadingFilter ? (
                  <Box className="center-spinner">
                    <FontAwesomeIcon
                      size="2x"
                      icon={faSpinner}
                      spin
                      color="rgba(0, 106, 245, 1)"
                    />
                  </Box>
                ) : (
                  ticketByCompany.map((ticket) => (
                    <TicketItem
                      key={ticket.ticketid}
                      ticket={ticket}
                      translationStatus={translationStatus}
                      statusColors={statusColors}
                      statusTextColors={statusTextColors}
                      formatCreatedTime={formatCreatedTime}
                      navigate={navigate}
                      followTicket={followTicket}
                      setRes={setTicketByCompany}
                    />
                  ))
                )}
                {isLoading && !allTicketsLoaded && (
                  <Box className="center-spinner">
                    <FontAwesomeIcon
                      size="2x"
                      icon={faSpinner}
                      spin
                      color="rgba(0, 106, 245, 1)"
                    />
                  </Box>
                )}
                <Box height={120}></Box>
              </Tabs.Tab>
              <Tabs.Tab
                key="follow"
                label={
                  <Text
                    style={{
                      textAlign: "center",
                      fontWeight: currentTabCompany === "follow" ? 500 : 400,
                      color:
                        currentTabCompany === "follow"
                          ? "rgba(18, 144, 255, 1)"
                          : "rgba(118, 122, 127, 1)",
                    }}
                  >
                    {`Theo dõi (${
                      getFollowTicketsCount() > 99
                        ? "99+"
                        : getFollowTicketsCount()
                    })`}
                  </Text>
                }
                style={{ flex: 1 }}
              >
                {ticketByCompany.length === 0 ? (
                  // Component hiển thị ticket đang trống
                  <TicketEmpty />
                ) : loadingFilter ? (
                  <Box className="center-spinner">
                    <FontAwesomeIcon
                      size="2x"
                      icon={faSpinner}
                      spin
                      color="rgba(0, 106, 245, 1)"
                    />
                  </Box>
                ) : (
                  ticketByCompany
                    .filter((ticket) => ticket.starred === "1")

                    .map((ticket) => (
                      <TicketItem
                        key={ticket.ticketid}
                        ticket={ticket}
                        translationStatus={translationStatus}
                        statusColors={statusColors}
                        statusTextColors={statusTextColors}
                        formatCreatedTime={formatCreatedTime}
                        navigate={navigate}
                        followTicket={followTicket}
                        setRes={setTicketByCompany}
                      />
                    ))
                )}

                {isLoading && !allTicketsLoaded && (
                  <Box className="center-spinner">
                    <FontAwesomeIcon
                      size="2x"
                      icon={faSpinner}
                      spin
                      color="rgba(0, 106, 245, 1)"
                    />
                  </Box>
                )}
                <Box height={100}></Box>
              </Tabs.Tab>
              <Tabs.Tab
                key="open"
                label={
                  <Text
                    style={{
                      textAlign: "center",
                      fontWeight: currentTabCompany === "open" ? 500 : 400,
                      color:
                        currentTabCompany === "open"
                          ? "rgba(18, 144, 255, 1)"
                          : "rgba(118, 122, 127, 1)",
                    }}
                  >
                    {`Mới (${
                      getStatusTicketsCount > 99 ? "99+" : getStatusTicketsCount
                    })`}
                  </Text>
                }
                style={{ flex: 1 }}
              >
                {ticketByCompany.length === 0 ? (
                  // Component hiển thị ticket đang trống
                  <TicketEmpty />
                ) : loadingFilter ? (
                  <Box className="center-spinner">
                    <FontAwesomeIcon
                      size="2x"
                      icon={faSpinner}
                      spin
                      color="rgba(0, 106, 245, 1)"
                    />
                  </Box>
                ) : (
                  ticketByCompany.map((ticket) => (
                    <TicketItem
                      key={ticket.ticketid}
                      ticket={ticket}
                      translationStatus={translationStatus}
                      statusColors={statusColors}
                      statusTextColors={statusTextColors}
                      formatCreatedTime={formatCreatedTime}
                      navigate={navigate}
                      followTicket={followTicket}
                      setRes={setTicketByCompany}
                    />
                  ))
                )}

                {isLoading && !allTicketsLoaded && (
                  <Box className="center-spinner">
                    <FontAwesomeIcon
                      size="2x"
                      icon={faSpinner}
                      spin
                      color="rgba(0, 106, 245, 1)"
                    />
                  </Box>
                )}
                <Box height={100}></Box>
              </Tabs.Tab>
              <Tabs.Tab
                key="process"
                label={
                  <Text
                    style={{
                      textAlign: "center",
                      fontWeight: currentTabCompany === "process" ? 500 : 400,
                      color:
                        currentTabCompany === "process"
                          ? "rgba(18, 144, 255, 1)"
                          : "rgba(118, 122, 127, 1)",
                    }}
                  >
                    {`Đang xử lý (${
                      getInProgressTicketsCount > 99
                        ? "99+"
                        : getInProgressTicketsCount
                    })`}
                  </Text>
                }
                style={{ flex: 1 }}
              >
                {ticketByCompany.length === 0 ? (
                  // Component hiển thị ticket đang trống
                  <TicketEmpty />
                ) : loadingFilter ? (
                  <Box className="center-spinner">
                    <FontAwesomeIcon
                      size="2x"
                      icon={faSpinner}
                      spin
                      color="rgba(0, 106, 245, 1)"
                    />
                  </Box>
                ) : (
                  ticketByCompany.map((ticket) => (
                    <TicketItem
                      key={ticket.ticketid}
                      ticket={ticket}
                      translationStatus={translationStatus}
                      statusColors={statusColors}
                      statusTextColors={statusTextColors}
                      formatCreatedTime={formatCreatedTime}
                      navigate={navigate}
                      followTicket={followTicket}
                      setRes={setTicketByCompany}
                    />
                  ))
                )}

                {isLoading && !allTicketsLoaded && (
                  <Box className="center-spinner">
                    <FontAwesomeIcon
                      size="2x"
                      icon={faSpinner}
                      spin
                      color="rgba(0, 106, 245, 1)"
                    />
                  </Box>
                )}
                <Box height={100}></Box>
              </Tabs.Tab>
              <Tabs.Tab
                key="done"
                label={
                  <Text
                    style={{
                      textAlign: "center",
                      fontWeight: currentTabCompany === "done" ? 500 : 400,
                      color:
                        currentTabCompany === "done"
                          ? "rgba(18, 144, 255, 1)"
                          : "rgba(118, 122, 127, 1)",
                    }}
                  >
                    {`Hoàn thành (${
                      getDoneTicket > 99 ? "99+" : getDoneTicket
                    })`}
                  </Text>
                }
                style={{ flex: 1 }}
              >
                {ticketByCompany.length === 0 ? (
                  // Component hiển thị ticket đang trống
                  <TicketEmpty />
                ) : loadingFilter ? (
                  <Box className="center-spinner">
                    <FontAwesomeIcon
                      size="2x"
                      icon={faSpinner}
                      spin
                      color="rgba(0, 106, 245, 1)"
                    />
                  </Box>
                ) : (
                  ticketByCompany.map((ticket) => (
                    <TicketItem
                      key={ticket.ticketid}
                      ticket={ticket}
                      translationStatus={translationStatus}
                      statusColors={statusColors}
                      statusTextColors={statusTextColors}
                      formatCreatedTime={formatCreatedTime}
                      navigate={navigate}
                      followTicket={followTicket}
                      setRes={setTicketByCompany}
                    />
                  ))
                )}

                {isLoading && !allTicketsLoaded && (
                  <Box className="center-spinner">
                    <FontAwesomeIcon
                      size="2x"
                      icon={faSpinner}
                      spin
                      color="rgba(0, 106, 245, 1)"
                    />
                  </Box>
                )}
                <Box height={100}></Box>
              </Tabs.Tab>
              <Tabs.Tab
                key="cancel"
                label={
                  <Text
                    style={{
                      textAlign: "center",
                      fontWeight: currentTabCompany === "cancel" ? 500 : 400,
                      color:
                        currentTabCompany === "cancel"
                          ? "rgba(18, 144, 255, 1)"
                          : "rgba(118, 122, 127, 1)",
                    }}
                  >
                    {`Hủy (${getCancelTicket > 99 ? "99+" : getCancelTicket})`}
                  </Text>
                }
                style={{ flex: 1 }}
              >
                {ticketByCompany.length === 0 ? (
                  // Component hiển thị ticket đang trống
                  <TicketEmpty />
                ) : loadingFilter ? (
                  <Box className="center-spinner">
                    <FontAwesomeIcon
                      size="2x"
                      icon={faSpinner}
                      spin
                      color="rgba(0, 106, 245, 1)"
                    />
                  </Box>
                ) : (
                  ticketByCompany.map((ticket) => (
                    <TicketItem
                      key={ticket.ticketid}
                      ticket={ticket}
                      translationStatus={translationStatus}
                      statusColors={statusColors}
                      statusTextColors={statusTextColors}
                      formatCreatedTime={formatCreatedTime}
                      navigate={navigate}
                      followTicket={followTicket}
                      setRes={setTicketByCompany}
                    />
                  ))
                )}

                {isLoading && !allTicketsLoaded && (
                  <Box className="center-spinner">
                    <FontAwesomeIcon
                      size="2x"
                      icon={faSpinner}
                      spin
                      color="rgba(0, 106, 245, 1)"
                    />
                  </Box>
                )}

                <Box height={100}></Box>
              </Tabs.Tab>
            </Tabs>
          </Tabs.Tab>
        </Tabs>
      </Page>
    </PullToRefresh>
  );
};

export default TicketsListPage;

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
  "Sent Confirm Email": "rgba(230, 250, 237, 1)",
  Reject: "rgba(244, 245, 246, 1)",
};

const statusTextColors = {
  Open: "rgba(0, 106, 245, 1)",
  Closed: "rgba(52, 183, 100, 1)",
  "In Progress": "rgba(106, 64, 191, 1)",
  "Wait For Verifying": "rgba(0, 106, 245, 1)",
  "Wait For Response": "rgba(0, 106, 245, 1)",
  Pending: "rgba(118, 122, 127, 1)",
  Testing: "rgba(52, 183, 100, 1)",
  "Customer Confirmed": "rgba(0, 106, 245, 1)",
  Assigned: "rgba(106, 64, 191, 1)",
  Reopen: "rgba(118, 122, 127, 1)",
  "Wait Close": "rgba(52, 183, 100, 1)",
  Cancel: "rgba(118, 122, 127, 1)",
  "Sent Confirm Email": "rgba(52, 183, 100, 1)",
  Reject: "rgba(118, 122, 127, 1)",
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
  "Sent Confirm Email": " Đã gửi email xác nhận",
  Reject: "Từ chối",
  Feedback: "Góp ý",
  Bug: "Báo lỗi",
  Other: "Khác",
};
