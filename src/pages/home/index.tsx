import React, { useEffect, useState } from "react";
import { Page, useNavigate, Box, Text, Button } from "zmp-ui";
import { NewsType, TicketType } from "../../type";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import {
  resState,
  isGetDataState,
  userInfoState,
  loadingState,
  loadToAppState,
  offsetState,
} from "../../states_recoil/states_recoil";
import PullToRefresh from "react-simple-pull-to-refresh";
import { useRecoilState } from "recoil";
import NewsComponent from "../../pages/news/index";
import UserInformation from "../../components/user_card";
import { useService } from "../../functions/common";
import TicketItem from "../../components/ticket";
import ActivatedAccountModal from "../../components/noti_allow_info";
import TicketEmpty from "../../components/ticket_empty";
const HomePage = ({ onIsGetDataChange }) => {
  const navigate = useNavigate();
  const profile = JSON.parse(localStorage.getItem("profile") || "{}"); // lấy profile từ local storage
  const [res, setRes] = useRecoilState(resState); // state để chứa data list ticket
  const [isGetData, setIsGetData] = useRecoilState(isGetDataState); // state check đã get được data chưa
  const [offset, setOffset] = useRecoilState(offsetState); // state global offset từ api get ticket list
  const [news, setNews] = useState<NewsType[]>([]); // state chứa danh sách tin tức trả về
  const [isRefreshing, setIsRefreshing] = useState(false); // state check refresh page
  const [isLoading, setIsLoading] = useState(false); // state loading app
  const [loadToApp, setLoadToApp] = useRecoilState(loadToAppState); // state loading app khi vào app lần đầu
  const [loading, setLoading] = useRecoilState(loadingState); // state loading danh sách ticket
  const [activated, setActivated] = useState(false); // state hiển thị modal khi chưa kích hoạt tài khoản
  const [getAccessTokenModal, setGetAccessTokenModal] = useState(false); // nếu KH chưa active account thì hiển thị modal
  const [loadingMore, setLoadingMore] = useState(false); // state loading more khi scroll
  const [userInfo, setUserInfo] = useRecoilState(userInfoState); //state chứa thông tin tài khoản

  /* Sử dụng các hàm từ file common.ts*/
  const service = useService();

  /*
   * Khi lần đầu vào app sẽ loading danh sách ticket, khi loaded lần đầu thì sẽ set lại global state
   * Lấy width và height của screen
   */
  useEffect(() => {
    if (!loadToApp) {
      setLoadToApp(false);
    }
    window.addEventListener("resize", service.handleWindowResize);
    return () => {
      window.removeEventListener("resize", service.handleWindowResize);
    };
  }, []);

  /**
   * Check nếu isGetData == true thì truyền state qua bottomNavigation
   * isGetData == true thì có thể chuyển qua các màn hình ở bottomNavigation
   */
  useEffect(() => {
    onIsGetDataChange(isGetData);
  }, [isGetData, onIsGetDataChange]);

  /**
   * import các hàm để sử dụng ở useService từ file common.ts
   */
  const {
    getAccessTokenAndPhoneNumber,
    configView,
    setLeftButton,
    fetchNews,
    fetchTickets,
    followTicket,
  } = useService();

  useEffect(() => {
    const fetchData = async () => {
      try {
        /* Gọi hàm để lấy access token và số điện thoại */
        await getAccessTokenAndPhoneNumber();

        /* Gọi các hàm khác ở đây nếu cần */

        /*chuyển trạng thái loading false sau khi get được contact*/
        setTimeout(() => {
          setIsRefreshing(false);
          setLoading(false);
          setLoadToApp(false);
        }, 1000);
      } catch (error) {
        /* Xử lý lỗi nếu có */
        console.error("Error fetching data:", error);
      }
    };
    /*gọi api zalo edit header */
    configView("My CloudGO", "none");

    /*gọi api ẩn left button header */
    setLeftButton("none");

    fetchData();
  }, []);

  /**
   * get danh sách tin tức
   */
  useEffect(() => {
    async function getNewsList() {
      const ListNews = await service.fetchNews();
      setNews(ListNews);
      return ListNews;
    }
    getNewsList();
  }, []);

  /**
   * format lại datetime
   */
  function formatCreatedTime(createdTime) {
    const date = new Date(createdTime);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    // return `${year}-${month}-${day}`;
    return createdTime.substring(0, 11);
  }

  /**
   * lấy danh sách tin tức mới nhất
   */
  const sortByNewest = (arr: TicketType[] | NewsType[]) => {
    return arr.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });
  };

  /**
   * getTicket khi mới khi gọi hàm này
   * hàm này gọi khi scroll danh sách ticket
   */
  const handleShowAllTickets = () => {
    if (offset !== undefined) {
      setIsLoading(true);
      setLoadingMore(true);

      setTimeout(() => {
        fetchTickets("", "", "", profile.data?.id, "", ["Open"]);
        setIsLoading(false);
        setLoadingMore(false);
      }, 2000);
    }
  };

  /**
   * check nếu height của danh sách ticket đã tối đa thì gọi handleShowAllTickets
   */
  const handleScroll = () => {
    if (!loadingMore && offset !== undefined) {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        handleShowAllTickets();
      }
    }
  };

  /**
   * get danh sách tin tức và get lại contact khi refresh app
   * getAccessTokenAndPhoneNumber để getcontact và lấy danh sách ticket theo contact đó
   */
  const handleReload = () => {
    fetchNews();
    fetchTickets("", "", "", profile.data.id, "", ["Open"]);
  };

  /**
   * gọi hàm này để refresh app
   */
  const handleRefresh = async () => {
    setOffset(0);
    setRes({ entry_list: [], paging: { total_count: 0 } });
    setIsRefreshing(true);
    setLoading(true);
    setTimeout(() => {
      handleReload();
      setIsRefreshing(false);
      setLoading(false);
    }, 1500);
  };

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
        {/* Component thông tin khách hàng */}
        <UserInformation
          userInfo={userInfo}
          isGetData={isGetData}
          navigate={navigate}
          setGetAccessTokenModal={setGetAccessTokenModal}
          resFont={service.resFont}
        />

        {/* Component danh sách tin tức */}
        <NewsComponent
          resFont={service.resFont}
          news={news}
          sortByNewest={sortByNewest}
          resWidth={service.resWidth}
          resHeight={service.resHeight}
          formatCreatedTime={formatCreatedTime}
          openUrlInWebview={service.openUrlInWebview}
        />
        <Box
          flex
          className="bgr-color"
          flexDirection="row"
          justifyContent="space-between"
          alignContent="center"
        >
          <Box
            className="section-container"
            style={{ fontWeight: 500, fontSize: "17px" }}
          >
            Ticket mới nhất
          </Box>
          <Box
            className="section-container"
            onClick={() => {
              navigate(`/tickets_list`);
            }}
          >
            <Text style={{ color: "rgba(0, 106, 245, 1)" }}>Xem tất cả</Text>
          </Box>
        </Box>

        <Box height={1} style={{ color: "grey" }} />
        {loadToApp && (
          <Box className="center-spinner">
            <FontAwesomeIcon
              size="2x"
              icon={faSpinner}
              spin
              color="rgba(0, 106, 245, 1)"
            />
          </Box>
        )}
        {!loadToApp &&
          (isGetData ? (
            res.entry_list.length === 0 || res.entry_list.length == 0 ? (
              // Component hiển thị ticket đang trống
              <TicketEmpty />
            ) : (
              /* Component danh sách ticket */
              res.entry_list.map((ticket: TicketType) => (
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
            )
          ) : (
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
                style={{
                  textAlign: "center",
                  paddingTop: "10px",
                  fontSize: "13px",
                }}
              >
                Vui lòng đồng ý chia sẻ thông tin hồ sơ và số điện thoại của bạn
                để liên kết với tài khoản của bạn trên hệ thống với My CloudGO
              </Text>
              <Button
                size="small"
                onClick={() => {
                  setActivated(true);
                }}
              >
                Kích hoạt
              </Button>
            </Box>
          ))}

        {isLoading && (
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
        <ActivatedAccountModal
          visible={activated || getAccessTokenModal}
          onClose={() => {
            setActivated(false);
            setGetAccessTokenModal(false);
          }}
          onClick={() => {
            getAccessTokenAndPhoneNumber();
            setGetAccessTokenModal(false);
            setActivated(false);
          }}
        />
      </Page>
    </PullToRefresh>
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
