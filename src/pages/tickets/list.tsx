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
  useSnackbar,
  Sheet,
  DatePicker,
  Switch,
} from "zmp-ui";
import { TicketType } from "../../type";
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
import { configAppView } from "zmp-sdk/apis";
import url_api from "../../service";
import axios from "axios";
import PullToRefresh from "react-simple-pull-to-refresh";
import { useRecoilState } from "recoil";
import {
  loadingListState,
  resCompanyState,
  ticketListState,
} from "../../states_recoil/states_recoil";
import { setNavigationBarLeftButton } from "zmp-sdk";
import TicketItem from "../../components/ticket";
const TicketsListPage: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const [getData, setGetData] = useRecoilState(ticketListState);
  const [res, setRes] = useRecoilState(resCompanyState);
  const [isGetData, setIsGetData] = useState(false);
  const [ticketByCompany, setTicketByCompany] = useState<TicketType[]>([]);
  const [searchText, setSearchText] = useState("");
  const [allTickets, setAllTickets] = useState<TicketType[]>([]);
  const [filteredTicketsCount, setFilteredTicketsCount] = useState(0);
  const [visibleTicketsCount, setVisibleTicketsCount] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filtering, setFiltering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filtered, setFiltered] = useState("");
  const [loading, setLoading] = useRecoilState(loadingListState);
  const { openSnackbar } = useSnackbar();
  const [isFollowing, setIsFollowing] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const contactData = JSON.parse(localStorage.getItem("contact") || "{}");
  const token = localStorage.getItem("token");
  const [sheetVisible, setSheetVisible] = useState(false);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [loadingFilter, setLoadingFilter] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [sortedAndFilteredTickets, setSortedAndFilteredTickets] = useState<
    TicketType[]
  >([]);
  const [sortedAndFilteredTicketsBackup, setSortedAndFilteredTicketsBackup] =
    useState<TicketType[]>([]);
  const [customDateVisible, setCustomDateVisible] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedButton, setSelectedButton] = useState("");
  const [closedTickets, setClosedTickets] = useState<TicketType[]>([]);
  const [followTickets, setFollowTickets] = useState<TicketType[]>([]);
  const [openTickets, setOpenTickets] = useState<TicketType[]>([]);
  const [cancelTickets, setCancelTickets] = useState<TicketType[]>([]);
  const [inProgressTickets, setInProgressTickets] = useState<TicketType[]>([]);
  const [totalAllTickets, setTotalAllTickets] = useState<number>(0);
  const [totalTicketCompany, setTotalTicketCompany] = useState<number>(0);
  const [totalfollowTickets, setTotalFollowTickets] = useState<number>(0);
  const [totalOpenTickets, setTotalOpenTickets] = useState<number>(0);
  const [loadMore, setLoadMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allTicketsLoaded, setAllTicketsLoaded] = useState(false);
  const [fetchInit, setFetchInit] = useState(false);
  const [totalInProgressTickets, setTotalInProgressTickets] =
    useState<number>(0);
  const [totalClosedTickets, setTotalClosedTickets] = useState<number>(0);
  const [totalCancelTickets, setTotalCancelTickets] = useState<number>(0);
  const [currentTab, setCurrentTab] = useState("tab1");
  const [currentTabCompany, setCurrentTabCompany] = useState("all");
  const [tabParent, setTabParent] = useState("forme");
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [screenHeight, setScreenHeight] = useState(window.innerHeight);

  const handleWindowResize = () => {
    setScreenWidth(window.innerWidth);
    setScreenHeight(window.innerHeight);
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
    } catch (error) {}
  };

  const setLeftButton = async () => {
    try {
      await setNavigationBarLeftButton({
        type: "back",
      });
    } catch (error) {
      // xử lý khi gọi api thất bại
      console.log(error);
    }
  };

  useEffect(() => {
    configView();
    setLeftButton();
    setGetData(true);
    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [loading, getData]);

  const resFont = (value) => {
    let fontValue = (value / 360) * screenWidth;
    return `${fontValue}px`;
  };

  const resHeight = (value) => {
    let fontValue = (value / 800) * screenHeight;
    return `${fontValue}px`;
  };

  const resWidth = (value) => {
    let fontValue = (value / 360) * screenWidth;
    return `${fontValue}px`;
  };

  const fetchTickets = async (tabKey) => {
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      if (token !== null) {
        headers["token"] = token;
      }
      let ticketStatus: string[] = [];
      switch (tabKey) {
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
          break;
        case "tab3":
          ticketStatus = ["Open"];
          break;
        case "tab4":
          ticketStatus = [
            "Customer Confirmed",
            "Assigned",
            "In Progress",
            "Wait Close",
          ];
          break;
        case "tab5":
          ticketStatus = ["Closed"];
          break;
        case "tab6":
          ticketStatus = ["Cancel"];
          break;
        // Các case khác nếu có
        default:
          break;
      }

      const response = await axios.post(
        url_api,
        JSON.stringify({
          RequestAction: "GetTicketList",
          Params: {
            cv_id: "",
            keyword: "",
            filters: {
              category: "",
              contact_id: contactData.data?.id,
              ticketstatus: ticketStatus,
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
      );
      const json = response.data.data.entry_list;

      setRes(json);
      setSortedAndFilteredTicketsBackup(json);
      setIsGetData(true);
      console.log("danh sách ticket của bạn", json);

      if (!fetchInit) {
        const followTickets = filterAndSortTickets(json, "tab2");
        const openTickets = filterAndSortTickets(json, "tab3");
        const inProgressTickets = filterAndSortTickets(json, "tab4");
        const closedTickets = filterAndSortTickets(json, "tab5");
        const cancelTickets = filterAndSortTickets(json, "tab6");
        setAllTickets(res);
        setTotalAllTickets(res.length);
        setTotalTicketCompany(ticketByCompany.length);
        setTotalFollowTickets(followTickets.length);
        setTotalOpenTickets(openTickets.length);
        setTotalInProgressTickets(inProgressTickets.length);
        setTotalClosedTickets(closedTickets.length);
        setTotalCancelTickets(cancelTickets.length);
        console.log("Danh sách ticket của bạn", json.length);
      }

      setIsRefreshing(false);
      setLoading(false);
      switch (tabKey) {
        case "tab1":
          setTotalAllTickets(json.length);
          break;
        case "tab3":
          setTotalOpenTickets(json.length);
          console.log("aaaaa");
          break;
        case "tab4":
          setTotalInProgressTickets(json.length);
          console.log("bbb");

          break;
        case "tab5":
          setClosedTickets(json.length);
          console.log("ccccccc");

          break;
        case "tab6":
          setClosedTickets(json.length);
          console.log("ddd");

          break;
        // Các case khác nếu có
        default:
          break;
      }
      setFetchInit(true);

      return json;
    } catch (error) {
      if (error === "SyntaxError: Unexpected token T in JSON at position 0") {
        navigate("/");
      } else {
        console.error(error);
      }
    }
  };

  const TicketByCompany = async (tabKeyCompany) => {
    try {
      if (contactData.data?.account_id === "0") {
        // Nếu account_id là 0, không gọi hàm và làm gì đó khác nếu cần
        console.log("account_id là 0, không thực hiện gọi TicketByCompany");
        return; // hoặc return một giá trị khác nếu cần
      }

      const headers = {
        "Content-Type": "application/json",
      };

      if (token !== null) {
        headers["token"] = token;
      }

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
      const response = await axios.post(
        url_api,
        JSON.stringify({
          RequestAction: "GetTicketList",
          Params: {
            cv_id: "",
            keyword: "",
            filters: {
              category: "",
              parent_id: contactData.data?.account_id,
              ticketstatus: ticketStatus,
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
      );

      const json = response.data.data.entry_list;

      setTicketByCompany(json);
      console.log("Danh sách ticket của công ty", json);
      setIsRefreshing(false);
      setLoading(false);
      return json;
    } catch (error) {
      if (error === "SyntaxError: Unexpected token T in JSON at position 0") {
        navigate("/");
      } else {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    if (loadMore) {
      setIsLoading(true);
      setLoadMore(false);

      const newVisibleCount = visibleTicketsCount + 10;
      if (newVisibleCount >= sortedAndFilteredTickets.length) {
        setAllTicketsLoaded(true);
      }

      setVisibleTicketsCount(newVisibleCount);
      setIsLoading(false);
    }
  }, [loadMore, visibleTicketsCount, sortedAndFilteredTickets]);

  const followTicket = (ticketid) => {
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
        console.log("Đã theo dõi:", response.data.data);
        setIsFollowing(true);
        openSnackbar({
          text: "Đã theo dõi ticket",
          type: "success",
        });
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
        url_api,
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
        console.log("Hủy theo dõi:", response.data.data);
        setIsFollowing(false);
        openSnackbar({
          text: "Đã hủy theo dõi ticket",
          type: "success",
        });
      })
      .catch((error) => {
        console.error("Lỗi khi follow:", error);
      });
  };

  const handleBeforeUnload = () => {
    // Xóa dữ liệu từ localStorage
    localStorage.removeItem("tickets");
  };

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    fetchTickets("tab1");
    TicketByCompany("all");
  }, []);

  const sortTickets = (sortBy) => {
    let filteredAndSorted = [...sortedAndFilteredTicketsBackup];
    // setRes(filteredAndSorted);

    if (sortBy === "today") {
      const today = new Date();
      const startOfToday = startOfDay(today).getTime();
      const endOfToday = endOfDay(today).getTime();
      setFiltered("today");
      console.log("hôm nay");
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
      console.log("hôm nay");

      filteredAndSorted = filteredAndSorted.filter((ticket) => {
        const ticketTime = new Date(ticket.createdtime).getTime();
        return ticketTime >= startOfMonthDate && ticketTime <= endOfMonthDate;
      });
    }
    setRes(filteredAndSorted);
    setTicketByCompany(filteredAndSorted);
    setFollowTickets(filteredAndSorted);
    // setTotalTicketCompany(filteredAndSorted);
    setOpenTickets(filteredAndSorted);
    setInProgressTickets(filteredAndSorted);
    setClosedTickets(filteredAndSorted);
    setCancelTickets(filteredAndSorted);
    setSortedAndFilteredTickets(filteredAndSorted);

    switch (currentTab) {
      case "tab1":
        setTotalAllTickets(filteredAndSorted.length);
        break;
      case "tab2":
        setTotalFollowTickets(filteredAndSorted.length);
        break;
      case "tab3":
        setTotalOpenTickets(filteredAndSorted.length);
        break;
      case "tab4":
        setTotalInProgressTickets(filteredAndSorted.length);

        break;
      case "tab5":
        setTotalClosedTickets(filteredAndSorted.length);

        break;
      case "tab6":
        setTotalCancelTickets(filteredAndSorted.length);

        break;
    }
    console.log(`Danh sách vé đã được sắp xếp theo: ${sortBy}`);
  };

  const updateTickets = () => {
    const filteredAndSorted = filterAndSortTickets(
      res.length > sortedAndFilteredTicketsBackup.length
        ? res
        : sortedAndFilteredTicketsBackup,
      currentTab
    );
    setSortedAndFilteredTickets(filteredAndSorted);
    setSortedAndFilteredTicketsBackup(filteredAndSorted);
    setFilteredTicketsCount(filteredAndSorted.length);
    // Cập nhật các danh sách vé tương ứng
    if (currentTab === "tab2") {
      setFollowTickets(filteredAndSorted);
    } else if (currentTab === "tab3") {
      setOpenTickets(filteredAndSorted);
    } else if (currentTab === "tab4") {
      setInProgressTickets(filteredAndSorted);
    } else if (currentTab === "tab5") {
      setClosedTickets(filteredAndSorted);
    } else if (currentTab === "tab6") {
      setCancelTickets(filteredAndSorted);
    }
  };

  const filterAndSortTickets = (
    tickets: TicketType[],
    status: string
  ): TicketType[] => {
    let filtered = tickets.filter((ticket) => {
      if (status === "tab1") {
        return true;
      } else if (status === "tab2") {
        return ticket.starred === "1";
      } else if (status === "tab3") {
        return ["Open", "Reopen", "Wait For Verifying"].includes(ticket.status);
      } else if (status === "tab4") {
        return [
          "In Progress",
          "Wait Close",
          "Assigned",
          "Customer Confirmed",
          "Sent Confirm Email",
          "Testing",
          "Wait For Response",
          "Pending",
        ].includes(ticket.status);
      } else if (status === "tab5") {
        return ticket.status === "Closed";
      } else if (status === "tab6") {
        return ["Cancel", "Reject"].includes(ticket.status);
      }
      return false;
    });

    return filtered;
  };

  // useEffect(() => {
  //   const followTickets = filterAndSortTickets(res, "tab2");
  //   const openTickets = filterAndSortTickets(res, "tab3");
  //   const inProgressTickets = filterAndSortTickets(res, "tab4");
  //   const closedTickets = filterAndSortTickets(res, "tab5");
  //   const cancelTickets = filterAndSortTickets(res, "tab6");
  //   setAllTickets(res);
  //   setTotalAllTickets(res.length);
  //   setTotalTicketCompany(ticketByCompany.length);
  //   setTotalFollowTickets(followTickets.length);
  //   setTotalOpenTickets(openTickets.length);
  //   setTotalInProgressTickets(inProgressTickets.length);
  //   setTotalClosedTickets(closedTickets.length);
  //   setTotalCancelTickets(cancelTickets.length);

  //   setFollowTickets(followTickets);
  //   setOpenTickets(openTickets);
  //   setInProgressTickets(inProgressTickets);
  //   setClosedTickets(closedTickets);
  //   setCancelTickets(cancelTickets);
  // }, []);

  useEffect(() => {
    updateTickets();
  }, [currentTab, sortBy, res]);

  function formatCreatedTime(createdTime) {
    const date = new Date(createdTime);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    // return `${year}-${month}-${day}`;
    return createdTime.substring(0, 11);
  }

  const handleShowAllTickets = () => {
    if (!allTicketsLoaded) {
      setIsLoading(true);
      setLoadingMore(true);

      setTimeout(() => {
        const newVisibleCount = visibleTicketsCount + 10;

        if (newVisibleCount >= sortedAndFilteredTickets.length) {
          setAllTicketsLoaded(true);
        }

        setShowAllTickets(true);
        setVisibleTicketsCount(newVisibleCount);
        setIsLoading(false);
        setLoadingMore(false);
      }, 2000);
    }
  };

  const handleScroll = () => {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight &&
      !loadingMore
    ) {
      handleShowAllTickets();
    }
  };

  const handleReload = () => {
    localStorage.removeItem("tickets");
    localStorage.removeItem("newsData");
    console.log("reload");
    setFiltering(false);

    fetchTickets([]);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setLoading(true);
    handleReload();
  };

  // useEffect(() => {
  //   // Your existing code for configView and event listener

  //   // Run loading logic only once when the component mounts
  //   setLoading(true);
  //   setIsLoading(false); // Set isLoading to false after initial loading
  //   handleRefresh(); // Optionally, you can call your loading logic here
  // }, []);

  const handleCustomDateClick = (buttonName) => {
    setCustomDateVisible(true);
    setSelectedButton(buttonName);
  };

  const handleOtherButtonClick = (buttonValue) => {
    sortTickets(buttonValue);
    setSelectedButton(buttonValue);
    setSheetVisible(false);
    setCustomDateVisible(false);
    setLoadingFilter(true);
    setFiltering(true);
    setTimeout(() => {
      setLoadingFilter(false);
    }, 1500);
  };

  const handlePickder = () => {
    const filteredTickets = sortedAndFilteredTicketsBackup.filter((ticket) => {
      const ticketTime = new Date(ticket.createdtime).getTime();
      return startDate && endDate
        ? ticketTime >= startOfDay(startDate).getTime() &&
            ticketTime <= endOfDay(endDate).getTime()
        : true;
    });
    console.log("Ticket sau khi filter:", filteredTickets);

    // Cập nhật số lượng ticket đã lọc
    setFilteredTicketsCount(filteredTickets.length);
    setTotalTicketCompany(ticketByCompany.length);
    setTotalFollowTickets(followTickets.length);
    setTotalOpenTickets(openTickets.length);
    setTotalInProgressTickets(inProgressTickets.length);
    setTotalClosedTickets(closedTickets.length);
    setTotalCancelTickets(cancelTickets.length);
    console.log("Số lượng ticket sau khi filter:", filteredTickets.length);
    setRes(filteredTickets);
    setFollowTickets(filteredTickets);
    setOpenTickets(filteredTickets);
    setInProgressTickets(filteredTickets);
    setClosedTickets(filteredTickets);
    setCancelTickets(filteredTickets);
    setSortedAndFilteredTickets(filteredTickets);
    setTicketByCompany(filteredTickets);
  };

  const handleConfirmButtonClick = () => {
    // Kiểm tra xem startDate và endDate có tồn tại
    if (startDate && endDate) {
      handlePickder();
      setCustomDateVisible(false); // Đặt false thay vì true
      setLoadingFilter(true);
      setFiltering(true);
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
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [allTicketsLoaded, loadingMore]);

  const handleScrollAndReload = () => {
    handleScroll();
  };

  // useEffect(() => {
  //   // Run loading logic only once when the component mounts
  //   if (!isLoading) {
  //     handleRefresh();
  //     setIsLoading(true); // Set isLoading to true to prevent reloading on subsequent renders
  //   }
  // }, []);

  useEffect(() => {
    // Simulate an asynchronous operation
    const delay = setTimeout(() => {
      setIsLoading(false);
      clearTimeout(delay);
    }, 3000);

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
        onScroll={handleScrollAndReload}
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
                    height: resHeight(40),
                    borderRadius: "4px",
                  }}
                  type="text"
                  placeholder="Tìm ticket theo tên, mã, trạng thái"
                  value={searchText}
                  onClick={() => {
                    navigate(`/tickets/search?q=${searchText}`);
                  }}
                  onChange={(e) => setSearchText(e.target.value)}
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
                  setActionSheetVisible(true);
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
                    onClick={handleConfirmButtonClick}
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
                // console.log("aa", tabKey);
                fetchTickets(tabKey);
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
                    {totalAllTickets > 99 ? "99+" : totalAllTickets})
                  </Text>
                }
                style={{ flex: 1 }}
              >
                {sortedAndFilteredTickets.length === 0 || res.length == 0 ? (
                  <Box mt={5} style={{ textAlign: "center" }}>
                    <img
                      src="https://cdn-icons-png.flaticon.com/128/4076/4076419.png"
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
                  res
                    .slice(0, visibleTicketsCount)
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
                    {totalfollowTickets > 99 ? "99+" : totalfollowTickets})
                  </Text>
                }
                style={{ flex: 1 }}
              >
                {followTickets.length === 0 ? (
                  <Box m={4} style={{ textAlign: "center" }}>
                    <img
                      src="https://cdn-icons-png.flaticon.com/128/4076/4076419.png"
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
                  res.map((ticket) => (
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
                    {totalOpenTickets > 99 ? "99+" : totalOpenTickets})
                  </Text>
                }
                style={{ flex: 1 }}
              >
                {openTickets.length === 0 ? (
                  <Box m={4} style={{ textAlign: "center" }}>
                    <img
                      src="https://cdn-icons-png.flaticon.com/128/4076/4076419.png"
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
                  res
                    .slice(0, visibleTicketsCount)
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
                    {totalInProgressTickets > 99
                      ? "99+"
                      : totalInProgressTickets}
                    )
                  </Text>
                }
                style={{ flex: 1 }}
              >
                {inProgressTickets.length === 0 ? (
                  <Box m={4} style={{ textAlign: "center" }}>
                    <img
                      src="https://cdn-icons-png.flaticon.com/128/4076/4076419.png"
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
                  res
                    .slice(0, visibleTicketsCount)
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
                    {totalClosedTickets > 99 ? "99+" : totalClosedTickets})
                  </Text>
                }
                style={{ flex: 1 }}
              >
                {closedTickets.length === 0 ? (
                  <Box m={4} style={{ textAlign: "center" }}>
                    <img
                      src="https://cdn-icons-png.flaticon.com/128/4076/4076419.png"
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
                  res
                    .slice(0, visibleTicketsCount)
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
                    {totalCancelTickets > 99 ? "99+" : totalCancelTickets})
                  </Text>
                }
                style={{ flex: 1 }}
              >
                {cancelTickets.length === 0 ? (
                  <Box m={4} style={{ textAlign: "center" }}>
                    <img
                      src="https://cdn-icons-png.flaticon.com/128/4076/4076419.png"
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
                  res
                    .slice(0, visibleTicketsCount)
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
                    height: resHeight(40),
                    borderRadius: "4px",
                  }}
                  type="text"
                  placeholder="Tìm ticket theo tên, mã, trạng thái"
                  value={searchText}
                  onClick={() => {
                    navigate(`/tickets/search?q=${searchText}`);
                  }}
                  onChange={(e) => setSearchText(e.target.value)}
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
                  setActionSheetVisible(true);
                  setSheetVisible(true);
                }}
              >
                <Icon
                  size={24}
                  icon={"zi-filter"}
                  style={{
                    color: filtering
                      ? "rgba(18, 144, 255, 1)"
                      : "rgba(118, 122, 127, 1)",
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
                    onClick={handleConfirmButtonClick}
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
                console.log("aa", tabKeyCompany);
                TicketByCompany(tabKeyCompany);
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
                      src="https://cdn-icons-png.flaticon.com/128/4076/4076419.png"
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
                  ticketByCompany
                    .slice(0, visibleTicketsCount)
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
                  <Box m={4} style={{ textAlign: "center" }}>
                    <img
                      src="https://cdn-icons-png.flaticon.com/128/4076/4076419.png"
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
                  ticketByCompany
                    .filter((ticket) => ticket.starred === "1")
                    .slice(0, visibleTicketsCount)
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
                  <Box m={4} style={{ textAlign: "center" }}>
                    <img
                      src="https://cdn-icons-png.flaticon.com/128/4076/4076419.png"
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
                  ticketByCompany
                    .slice(0, visibleTicketsCount)
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
                  <Box m={4} style={{ textAlign: "center" }}>
                    <img
                      src="https://cdn-icons-png.flaticon.com/128/4076/4076419.png"
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
                  ticketByCompany
                    .slice(0, visibleTicketsCount)
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
                  <Box m={4} style={{ textAlign: "center" }}>
                    <img
                      src="https://cdn-icons-png.flaticon.com/128/4076/4076419.png"
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
                  ticketByCompany
                    .slice(0, visibleTicketsCount)
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
                  <Box m={4} style={{ textAlign: "center" }}>
                    <img
                      src="https://cdn-icons-png.flaticon.com/128/4076/4076419.png"
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
                  ticketByCompany
                    .slice(0, visibleTicketsCount)
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
