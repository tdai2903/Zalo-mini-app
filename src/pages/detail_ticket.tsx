import React, { useEffect, useState, useRef } from "react";
import {
  Button,
  Input,
  Box,
  Page,
  Text,
  Icon,
  Tabs,
  Modal,
  useSnackbar,
  Avatar,
  ImageViewer,
} from "zmp-ui";
import {
  onConfirmToExit,
  offConfirmToExit,
  openShareSheet,
  closeApp,
  configAppView,
} from "zmp-sdk/apis";
import url_api from "../service";
import { useLocation, useNavigate } from "react-router";
import PullToRefresh from "react-simple-pull-to-refresh";
import axios from "axios";
import { CommentType, RatingType } from "../type";
const DetailTicketPage: React.FunctionComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const commentInputRef = useRef(null);
  const { openSnackbar } = useSnackbar();
  const ticket = location.state;
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const Detail = JSON.parse(localStorage.getItem("detail_ticket") || "{}");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTicketReopened, setIsTicketReopened] = useState(false);
  const [isTicketCanceled, setIsTicketCanceled] = useState(false);
  const [isTicketClosed, setIsTicketClosed] = useState(false);
  const [isCusConfirm, setIsCusConfirm] = useState(false);
  const [visible, setVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showReOpenModal, setShowReOpenModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [currentTab, setCurrentTab] = useState("tab1");
  const [isFollowing, setIsFollowing] = useState(false);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [replyToComment, setReplyToComment] = useState<string | null>(null);
  const [showMoreText, setShowMoreText] = useState(false);
  const contactData = JSON.parse(localStorage.getItem("contact") || "{}");
  const token = localStorage.getItem("token");
  const [isStarred, setIsStarred] = useState(ticket.starred === "1");
  const [ratingText, setRatingText] = useState("(Chọn để đánh giá)");
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [boxStates, setBoxStates] = useState({
    ticketInfo: true,
    contactInfo: true,
    descriptionInfo: true,
    imagesInfo: true,
    solutionInfo: true,
    ratingInfo: true,
  });
  const initialTicketState: RatingType = {
    helpdesk_rating: 0,
    rating_description: "",
  };
  const [newRating, setNewRating] = React.useState<RatingType>({
    ...initialTicketState,
  });
  const inputData = "@[Zalo App](Users:1847) abc";
  const images: File[] = ticket.images;
  const configView = async () => {
    try {
      await configAppView({
        headerColor: "#006AF5",
        headerTextColor: "white",
        hideAndroidBottomNavigationBar: true,
        hideIOSSafeAreaBottom: true,
        actionBar: {
          title: "Chi tiết Ticket",
          leftButton: "back",
        },
      });
      // xử lý khi gọi api thành công
    } catch (error) {
      // xử lý khi gọi api thất bại
    }
  };

  const shareCurrentPage = async () => {
    try {
      const data = await openShareSheet({
        type: "zmp",
        data: {
          title: "My Zalo Mini App - My Account",
          description: "My Account",
          thumbnail:
            "https://media.licdn.com/dms/image/D5603AQF1JgxmPkGAPg/profile-displayphoto-shrink_800_800/0/1685007580930?e=2147483647&v=beta&t=lSE_w3LRlZhMxBc1nkCQ1LBXMgm9OIqEEyDFNGQ3GPw",
          path: `${location.pathname}${location.search}`,
        },
      });
      console.log("share ");
      console.log(location);
    } catch (err) {}
  };

  useEffect(() => {
    configView();
  }, []);

  useEffect(() => {
    onConfirmToExit(() => setConfirmModalVisible(true));
    return () => offConfirmToExit();
  }, []);

  const [res, setRes] = React.useState({
    data: {
      ticket_title: "",
      ticket_no: "",
      ticketpriorities: "",
      ticketstatus: "",
      ticketcategories: "",
      createdtime: "",
      description: "",
      main_owner_name: "",
      modifiedtime: "",
      contact_name: "",
      contact_email: "",
      contact_mobile: "",
      solution: "",
      helpdesk_subcategory: "",
      related_cpinstance_name: "",
      imagename: "",
      imagename_path: "",
      id: "",
      helpdesk_rating: "",
      rating_description: "",
    },
  });

  // const text = res.data.description;
  // const newText = text.split(/<br \/>|\\n/);

  const detailTickets = async () => {
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
            RequestAction: "GetTicket",
            Params: {
              id: ticket.ticketid,
            },
          }),
          {
            headers: headers,
          }
        )
        .then((response) => {
          console.log(
            "Call api GetDetailTicket thành công:",
            response.data.data
          );
          const json = response.data.data;
          localStorage.setItem("detail_ticket", JSON.stringify(json));
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

  const reOpenTicket = () => {
    openSnackbar({
      text: "Đang mở lại ticket...",
      type: "loading",
      duration: 5000,
    });
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
          RequestAction: "UpdateTicketStatus",
          Data: {
            ticket_id: ticket.ticketid,
            ticketstatus: "Reopen",
            rating_description: newRating.rating_description,
          },
        }),
        {
          headers: headers,
        }
      )
      .then((response) => {
        const data = response.data;
        console.log("Đã mở lại ticket:", data);
        openSnackbar({
          text: "Đã mở lại ticket",
          type: "success",
        });
        detailTickets();
        setNewRating(initialTicketState);
      })
      .catch((error) => {
        console.error("Lỗi khi đánh giá:", error);
      });
  };

  const closedTicket = () => {
    openSnackbar({
      text: "Đang tiến hành đóng ticket...",
      type: "loading",
      duration: 5000,
    });
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
          RequestAction: "UpdateTicketStatus",
          Data: {
            ticket_id: ticket.ticketid,
            ticketstatus: "Closed",
            rating_description: Detail.data.rating_description,
          },
        }),
        {
          headers: headers,
        }
      )
      .then((response) => {
        const data = response.data;
        console.log("Đã đóng ticket:", data);
        openSnackbar({
          text: "Đã đóng ticket",
          type: "success",
        });
        detailTickets();
      })
      .catch((error) => {
        console.error("Lỗi khi đóng:", error);
      });
  };

  const ratingTicket = () => {
    openSnackbar({
      text: "Đang đánh giá ticket...",
      type: "loading",
      duration: 5000,
    });
    const headers = {
      "Content-Type": "application/json",
    };

    if (token !== null) {
      headers["token"] = token;
    }
    let data = JSON.stringify({
      RequestAction: "RatingTicket",
      Data: {
        ticket_id: ticket.ticketid,
        rating: newRating.helpdesk_rating,
        rating_description: newRating.rating_description,
      },
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: url_api,
      headers: headers,
      data: data,
    };

    axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        closedTicket();
        openSnackbar({
          text: "Đã đánh giá ticket",
          type: "success",
        });
        detailTickets();
        // if (newRating.helpdesk_rating >= 1 && newRating.helpdesk_rating <= 2) {
        //   createNewTicket(
        //     newRating.helpdesk_rating,
        //     newRating.rating_description
        //   );
        // }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const confirmTicket = () => {
    openSnackbar({
      text: "Đang tiến hành xác nhận ticket...",
      type: "loading",
      duration: 5000,
    });
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
          RequestAction: "UpdateTicketStatus",
          Data: {
            ticket_id: ticket.ticketid,
            ticketstatus: "Customer Confirmed",
            rating_description: Detail.data.rating_description,
          },
        }),
        {
          headers: headers,
        }
      )
      .then((response) => {
        const data = response.data;
        console.log("Đã mở lại ticket:", data);
        openSnackbar({
          text: "Đã xác nhận ticket",
          type: "success",
        });
        detailTickets();
      })
      .catch((error) => {
        console.error("Lỗi khi đánh giá:", error);
      });
  };

  const cancelTicket = () => {
    openSnackbar({
      text: "Đang tiến hành hủy ticket...",
      type: "loading",
      duration: 5000,
    });
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
          RequestAction: "UpdateTicketStatus",
          Data: {
            ticket_id: ticket.ticketid,
            ticketstatus: "Cancel",
            rating_description: Detail.data.rating_description,
          },
        }),
        {
          headers: headers,
        }
      )
      .then((response) => {
        const data = response.data;
        console.log("Đã hủy ticket:", data);
        openSnackbar({
          text: "Đã hủy ticket",
          type: "success",
        });
        detailTickets();
      })
      .catch((error) => {
        console.error("Lỗi khi đánh giá:", error);
      });
  };

  const createNewTicket = async (helpdesk_rating, rating_description) => {
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      if (token !== null) {
        headers["token"] = token;
      }
      let data = JSON.stringify({
        RequestAction: "SaveTicket",
        Data: {
          ticket_title: Detail.data.ticket_title,
          ticketpriorities: Detail.data.ticketpriorities,
          ticketstatus: "Closed",
          ticketcategories: Detail.data.ticketcategories,
          description: Detail.data.description,
          helpdesk_subcategory: Detail.data.helpdesk_subcategory,
          contact_name: Detail.data.contact_name,
          contact_mobile: Detail.data.contact_mobile,
          contact_id: Detail.data.id,
          contact_email: Detail.data.contact_email,
          imagename_path: Detail.data.imagename_path,
          solution: Detail.data.solution,
          ticketseverities: "Critical",
          helpdesk_customer_group: "Internal",
          helpdesk_rating: helpdesk_rating,
          rating_description: rating_description,
        },
      });

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: url_api,
        headers: headers,
        data: data,
      };

      axios
        .request(config)
        .then((response) => {
          console.log(JSON.stringify(response.data.data));
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      if (error === "SyntaxError: Unexpected token T in JSON at position 0") {
        navigate("/");
      }
    }
  };

  const getCommentList = async () => {
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      if (token !== null) {
        headers["token"] = token;
      }
      const apiUrl = url_api;

      const requestBody = {
        RequestAction: "GetCommentList",
        Params: {
          module: "HelpDesk",
          record_related_id: ticket.ticketid,
        },
      };

      const response = await axios.post(apiUrl, JSON.stringify(requestBody), {
        headers: headers,
      });

      if (response.status === 200) {
        console.log("Danh sách bình luận:", response.data.data.entry_list);
        const json = response.data.data.entry_list;
        setComments(json);
        setCommentCount(json.length);
        return response.data.data;
      } else {
        console.error("Lỗi khi lấy danh sách bình luận.");
        return null;
      }
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu lấy danh sách bình luận:", error);
      return null;
    }
  };

  const submitComment = () => {
    openSnackbar({
      text: "Đang gửi bình luận...",
      type: "loading",
      duration: 5000,
    });
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
          RequestAction: "SaveComment",
          Data: {
            commentcontent: newComment,
            related_to: ticket.ticketid,
            parent_comments: "",
            reasontoedit: "",
          },
        }),
        {
          headers: headers,
        }
      )
      .then((response) => {
        console.log("Gửi bình luận thành công:", response.data.data);
        setNewComment("");
        openSnackbar({
          text: "Đã gửi bình luận",
          type: "success",
        });
      })
      .catch((error) => {
        console.error("Lỗi khi gửi bình luận:", error);
      });
  };

  const submitReply = (comment) => {
    openSnackbar({
      text: "Đang gửi trả lời bình luận...",
      type: "loading",
      duration: 5000,
    });
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
          RequestAction: "SaveComment",
          Data: {
            commentcontent: newComment,
            related_to: ticket.ticketid,
            parent_comments: comment,
            reasontoedit: "",
          },
        }),
        {
          headers: headers,
        }
      )
      .then((response) => {
        console.log("Gửi bình luận trả lời thành công:", response.data.data);
        setNewComment("");
        setReplyToComment(null);
        openSnackbar({
          text: "Đã gửi trả lời bình luận",
          type: "success",
        });
      })
      .catch((error) => {
        console.error("Lỗi khi gửi bình luận trả lời:", error);
      });
  };

  const getTimeAgo = (timestamp) => {
    const currentTime = new Date();
    const commentTime = new Date(timestamp);
    const timeDifference = currentTime.getTime() - commentTime.getTime();

    const minutes = Math.floor(timeDifference / 60000);

    if (minutes < 1) {
      return "Vừa xong";
    } else if (minutes < 60) {
      return `${minutes} phút trước`;
    } else {
      const hours = Math.floor(minutes / 60);

      if (hours < 24) {
        return `${hours} giờ trước`;
      } else {
        const days = Math.floor(hours / 24);

        if (days < 7) {
          return `${days} ngày trước`;
        } else {
          const weeks = Math.floor(days / 7);

          if (weeks < 4) {
            return `${weeks} tuần trước`;
          } else {
            const months = Math.floor(weeks / 4);

            if (months < 12) {
              return `${months} tháng trước`;
            } else {
              const years = Math.floor(months / 12);
              return `${years} năm trước`;
            }
          }
        }
      }
    }
  };

  useEffect(() => {
    detailTickets();
    getCommentList();
  }, []);

  const handleReload = () => {
    console.log("reload");

    setTimeout(() => {
      getCommentList();
    }, 2000);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    handleReload();
    setIsRefreshing(false);
  };

  const handleToggleShowMore = () => {
    setShowMoreText(!showMoreText);
  };

  const lines = res.data.description.split("\n");
  const displayedLines = showMoreText ? lines : lines.slice(0, 3);

  const handleRatingChange = (value) => {
    setNewRating((prevRating) => ({
      ...prevRating,
      helpdesk_rating: value,
    }));

    switch (value) {
      case 1:
        setRatingText("Rất không hài lòng");
        break;
      case 2:
        setRatingText("Không hài lòng");
        break;
      case 3:
        setRatingText("Bình thường");
        break;
      case 4:
        setRatingText("Hài lòng");
        break;
      case 5:
        setRatingText("Rất hài lòng");
        break;
      default:
        setRatingText("(Chọn để đánh giá)");
        break;
    }
  };

  return (
    <PullToRefresh refreshing={isRefreshing} onRefresh={handleRefresh}>
      <Page
        className="section-page"
        hideScrollbar={true}
        // restoreScrollOnBack={false}
      >
        <Box className="title-detail-container">
          <Box>
            <Text
              style={{
                fontWeight: 500,
                fontSize: "17px",
                lineHeight: "20px",
                color: "rgba(20, 20, 21, 1)",
              }}
            >
              {res.data.ticketcategories
                ? `[${translationCategory[res.data.ticketcategories]}] `
                : "[Không có] "}
              {res.data.ticket_title}
            </Text>
          </Box>
          <Box
            flex
            flexDirection="row"
            alignContent="center"
            justifyContent="space-between"
            style={{ paddingTop: "8px" }}
          >
            <Box flex flexDirection="row" alignContent="center">
              <Box flex>
                {[1, 2, 3, 4, 5].map((value) => (
                  <Icon
                    key={value}
                    icon={
                      value <= Number(res.data.helpdesk_rating)
                        ? "zi-star-solid"
                        : "zi-star"
                    }
                    size={17}
                    style={{
                      color:
                        value <= Number(res.data.helpdesk_rating)
                          ? "gold"
                          : "rgba(20, 20, 21, 1)",
                      marginLeft: "2px",
                    }}
                  />
                ))}
              </Box>
              <Box ml={2} mr={2}>
                |
              </Box>
              <Text style={{ color: "rgba(118, 122, 127, 1)" }}>
                {res.data.ticket_no}
              </Text>
            </Box>
            <Box
              mr={1}
              width={100}
              flex
              flexDirection="row"
              alignContent="center"
              justifyContent="space-between"
            >
              <span
                style={{ display: "flex", alignItems: "center" }}
                onClick={() => {
                  navigate(`/edit_ticket?id=${ticket.ticketid}`);
                }}
              >
                <Icon
                  icon="zi-edit"
                  style={{ color: "rgba(118, 122, 127, 1)", cursor: "pointer" }}
                  size={22}
                ></Icon>
              </span>
              <span
                style={{ display: "flex", alignItems: "center" }}
                onClick={() => {
                  navigate("/create_ticket", {
                    state: {
                      ticket_title: res.data.ticket_title,
                      ticketcategories: res.data.ticketcategories,
                      helpdesk_subcategory: res.data.helpdesk_subcategory,
                      contact_name: res.data.contact_name,
                      contact_mobile: res.data.contact_mobile,
                      contact_email: res.data.contact_email,
                      description: res.data.description,
                      imagename_path: res.data.imagename_path,
                    },
                  });
                }}
              >
                <Icon
                  icon="zi-copy"
                  style={{ color: "rgba(118, 122, 127, 1)", cursor: "pointer" }}
                  size={22}
                ></Icon>
              </span>

              <span
                style={{ display: "flex", alignItems: "center" }}
                onClick={() => {
                  shareCurrentPage();
                }}
              >
                <Icon
                  icon="zi-share-external-2"
                  style={{ color: "rgba(0, 106, 245, 1)", cursor: "pointer" }}
                  size={22}
                ></Icon>
              </span>
            </Box>
          </Box>
          <Box
            mt={2}
            flex
            flexDirection="row"
            alignContent="center"
            justifyContent="space-between"
          >
            <Box
              className="status"
              alignContent="center"
              justifyContent="center"
              style={{
                backgroundColor: statusColors[res.data.ticketstatus],
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
                  color: statusTextColors[res.data.ticketstatus],
                  fontSize: "14px",
                  lineHeight: "25px",
                }}
              >
                {translationStatus[res.data.ticketstatus]}
              </Text>
            </Box>
            <Text style={{ color: "rgba(118, 122, 127, 1)", fontSize: "14px" }}>
              {res.data.createdtime}
            </Text>
          </Box>
        </Box>
        <Box mt={2}>
          <Tabs id="contact-list">
            <Tabs.Tab
              key="tab1"
              label={
                <Text
                  onClick={() => setCurrentTab("tab1")}
                  style={{
                    fontWeight: 500,
                    width: "180px",
                    textAlign: "center",
                    color:
                      currentTab === "tab1"
                        ? "rgba(0, 106, 245, 1)"
                        : "rgba(118, 122, 127, 1)",
                    paddingRight: "24px",
                    fontSize: "17px",
                  }}
                >
                  Chi tiết
                </Text>
              }
            >
              <Box mt={1} className="bgr-color">
                <Box
                  flex
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  style={{
                    paddingTop: "8px",
                    paddingBottom: "8px",
                    paddingLeft: "16px",
                    paddingRight: "16px",
                  }}
                >
                  <Text
                    style={{
                      fontWeight: 500,
                      fontSize: "17px",
                    }}
                  >
                    Thông tin Ticket
                  </Text>
                  <span
                    onClick={() => {
                      setBoxStates({
                        ...boxStates,
                        ticketInfo: !boxStates.ticketInfo,
                      });
                    }}
                  >
                    <Icon
                      style={{ cursor: "pointer" }}
                      icon={
                        boxStates.ticketInfo
                          ? "zi-chevron-up"
                          : "zi-chevron-down"
                      }
                    />
                  </span>
                </Box>

                {boxStates.ticketInfo && (
                  <Box flexDirection="column">
                    <Box
                      // mt={1}
                      height={1.5}
                      style={{ backgroundColor: "rgba(244, 245, 246, 1)" }}
                    ></Box>
                    <Box className="detail-container">
                      <Box mb={4}>
                        <Text style={{ color: "rgba(118, 122, 127, 1)" }}>
                          Mã Ticket
                        </Text>
                        <Text
                          style={{
                            color: "rgba(20, 20, 21, 1)",
                            fontWeight: 500,
                            paddingTop: "2px",
                          }}
                        >
                          {res.data.ticket_no}
                        </Text>
                      </Box>
                      <Box mb={4}>
                        <Text style={{ color: "rgba(118, 122, 127, 1)" }}>
                          Tiêu đề
                        </Text>
                        <Text
                          style={{
                            color: "rgba(20, 20, 21, 1)",
                            fontWeight: 500,
                            paddingTop: "2px",
                          }}
                        >
                          {res.data.ticket_title}
                        </Text>
                      </Box>
                      <Box mb={4}>
                        <Text style={{ color: "rgba(118, 122, 127, 1)" }}>
                          Danh mục
                        </Text>
                        <Text
                          style={{
                            color: "rgba(20, 20, 21, 1)",
                            fontWeight: 500,
                            paddingTop: "2px",
                          }}
                        >
                          {translationCategory[res.data.ticketcategories]}
                        </Text>
                      </Box>
                      <Box mb={4}>
                        <Text style={{ color: "rgba(118, 122, 127, 1)" }}>
                          Chi tiết danh mục
                        </Text>
                        <Text
                          style={{
                            color: "rgba(20, 20, 21, 1)",
                            fontWeight: 500,
                            paddingTop: "2px",
                          }}
                        >
                          {
                            translationSubCategory[
                              res.data.helpdesk_subcategory
                            ]
                          }
                        </Text>
                      </Box>
                      <Box>
                        <Text style={{ color: "rgba(118, 122, 127, 1)" }}>
                          Tình trạng
                        </Text>
                        <Box
                          className="status"
                          alignContent="center"
                          justifyContent="center"
                          style={{
                            backgroundColor:
                              statusColors[res.data.ticketstatus],
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
                              color: statusTextColors[res.data.ticketstatus],
                              fontSize: "14px",
                              lineHeight: "25px",
                            }}
                          >
                            {translationStatus[res.data.ticketstatus]}
                          </Text>
                        </Box>
                      </Box>
                      {/* <Box>
                      <Text style={{ color: "rgba(118, 122, 127, 1)" }}>
                        Link cài đặt
                      </Text>
                      <Text
                        style={{
                          color: "rgba(20, 20, 21, 1)",
                          fontWeight: 500,
                        }}
                      >
                        {res.data.related_cpinstance_name}
                      </Text>
                    </Box> */}
                    </Box>
                  </Box>
                )}
              </Box>

              <Box mt={2} className="bgr-color">
                <Box
                  flex
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  style={{
                    paddingTop: "8px",
                    paddingBottom: "8px",
                    paddingLeft: "16px",
                    paddingRight: "16px",
                  }}
                >
                  <Text
                    style={{
                      fontWeight: 500,
                      fontSize: "17px",
                    }}
                  >
                    Thông tin liên hệ
                  </Text>
                  <span
                    onClick={() => {
                      setBoxStates({
                        ...boxStates,
                        contactInfo: !boxStates.contactInfo,
                      });
                    }}
                  >
                    <Icon
                      style={{ cursor: "pointer" }}
                      icon={
                        boxStates.contactInfo
                          ? "zi-chevron-up"
                          : "zi-chevron-down"
                      }
                    />
                  </span>
                </Box>
                {boxStates.contactInfo && (
                  <Box>
                    <Box
                      height={1.5}
                      style={{ backgroundColor: "rgba(244, 245, 246, 1)" }}
                    ></Box>
                    <Box className="detail-container">
                      <Box mb={4}>
                        <Text
                          style={{
                            color: "rgba(118, 122, 127, 1)",
                          }}
                        >
                          Họ và tên
                        </Text>
                        <Text
                          style={{
                            color: "rgba(20, 20, 21, 1)",
                            fontWeight: 500,
                            paddingTop: "2px",
                          }}
                        >
                          {res.data.contact_name}
                        </Text>
                      </Box>
                      <Box mb={4}>
                        <Text
                          style={{
                            color: "rgba(118, 122, 127, 1)",
                          }}
                        >
                          Số điện thoại
                        </Text>
                        <Text
                          style={{
                            color: "rgba(20, 20, 21, 1)",
                            fontWeight: 500,
                            paddingTop: "2px",
                          }}
                        >
                          {res.data.contact_mobile.replace(/^84/, "0")}
                        </Text>
                      </Box>
                      <Box>
                        <Text
                          style={{
                            color: "rgba(118, 122, 127, 1)",
                          }}
                        >
                          Email
                        </Text>
                        <Text
                          style={{
                            color: "rgba(20, 20, 21, 1)",
                            fontWeight: 500,
                            paddingTop: "2px",
                          }}
                        >
                          {res.data.contact_email}
                        </Text>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
              <Box mt={2} className="bgr-color">
                <Box
                  flex
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  style={{
                    paddingTop: "8px",
                    paddingBottom: "8px",
                    paddingLeft: "16px",
                    paddingRight: "16px",
                  }}
                >
                  <Text style={{ fontWeight: 500, fontSize: "17px" }}>
                    Thông tin mô tả
                  </Text>
                  <span
                    onClick={() => {
                      setBoxStates({
                        ...boxStates,
                        descriptionInfo: !boxStates.descriptionInfo,
                      });
                    }}
                  >
                    <Icon
                      style={{ cursor: "pointer" }}
                      icon={
                        boxStates.descriptionInfo
                          ? "zi-chevron-up"
                          : "zi-chevron-down"
                      }
                    />
                  </span>
                </Box>
                {boxStates.descriptionInfo && (
                  <Box alignContent="center">
                    <Box
                      height={1.5}
                      style={{ backgroundColor: "rgba(244, 245, 246, 1)" }}
                    ></Box>
                    <Box className="detail-container">
                      <Text style={{ color: "rgba(118, 122, 127, 1)" }}>
                        Mô tả
                      </Text>

                      <Text style={{ fontWeight: 500, paddingTop: "2px" }}>
                        {res.data.description}
                      </Text>
                    </Box>
                  </Box>
                )}
              </Box>

              <Box mt={2} className="bgr-color">
                <Box
                  flex
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  style={{
                    paddingTop: "8px",
                    paddingBottom: "8px",
                    paddingLeft: "16px",
                    paddingRight: "16px",
                  }}
                >
                  <Text style={{ fontWeight: 500, fontSize: "17px" }}>
                    Thông tin hình ảnh
                  </Text>
                  <span
                    onClick={() => {
                      setBoxStates({
                        ...boxStates,
                        imagesInfo: !boxStates.imagesInfo,
                      });
                    }}
                  >
                    <Icon
                      style={{ cursor: "pointer" }}
                      icon={
                        boxStates.imagesInfo
                          ? "zi-chevron-up"
                          : "zi-chevron-down"
                      }
                    />
                  </span>
                </Box>

                {boxStates.imagesInfo && (
                  <Box>
                    <Box
                      height={1.5}
                      style={{ backgroundColor: "rgba(244, 245, 246, 1)" }}
                    ></Box>
                    {res.data.imagename_path && (
                      <Box className="detail-container" flexDirection="row">
                        {res.data.imagename_path
                          .slice(0, 6)
                          .map((imagePath, index) => (
                            <img
                              key={index}
                              style={{
                                height: "75px",
                                width: "75px",
                                paddingRight: "6px",
                              }}
                              onClick={() => {
                                setActiveIndex(index);
                                setVisible(true);
                              }}
                              src={`https://pms-dev.cloudpro.vn/${imagePath}`}
                              alt={`Hình ảnh ${index + 1}`}
                            />
                          ))}
                      </Box>
                    )}
                  </Box>
                )}
                {visible && (
                  <ImageViewer
                    onClose={() => setVisible(false)}
                    activeIndex={activeIndex}
                    images={res.data.imagename_path
                      .slice(0, 6)
                      .map((imagePath, index) => ({
                        src: `https://pms-dev.cloudpro.vn/${imagePath}`,
                        alt: `Hình ảnh ${index + 1}`,
                        key: `${index + 1}`,
                      }))}
                    visible={visible}
                  />
                )}
              </Box>

              <Box mt={2} className="bgr-color">
                <Box
                  flex
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  style={{
                    paddingTop: "8px",
                    paddingBottom: "8px",
                    paddingLeft: "16px",
                    paddingRight: "16px",
                  }}
                >
                  <Text style={{ fontWeight: 500, fontSize: "17px" }}>
                    Giải pháp xử lý
                  </Text>
                  <span
                    onClick={() => {
                      setBoxStates({
                        ...boxStates,
                        solutionInfo: !boxStates.solutionInfo,
                      });
                    }}
                  >
                    <Icon
                      style={{ cursor: "pointer" }}
                      icon={
                        boxStates.solutionInfo
                          ? "zi-chevron-up"
                          : "zi-chevron-down"
                      }
                    />
                  </span>
                </Box>
                {boxStates.solutionInfo && (
                  <Box alignContent="center">
                    <Box
                      height={1.5}
                      style={{ backgroundColor: "rgba(244, 245, 246, 1)" }}
                    ></Box>
                    <Box className="detail-container">
                      <Text style={{ color: "rgba(118, 122, 127, 1)" }}>
                        Giải pháp
                      </Text>
                      <Text style={{ fontWeight: 500, paddingTop: "2px" }}>
                        {res.data.solution}
                      </Text>
                    </Box>
                  </Box>
                )}
              </Box>

              <Box mt={2} className="bgr-color">
                <Box
                  flex
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  style={{
                    paddingTop: "8px",
                    paddingBottom: "8px",
                    paddingLeft: "16px",
                    paddingRight: "16px",
                  }}
                >
                  <Text style={{ fontWeight: 500, fontSize: "17px" }}>
                    Nhận xét của khách hàng
                  </Text>
                  <span
                    onClick={() => {
                      setBoxStates({
                        ...boxStates,
                        ratingInfo: !boxStates.ratingInfo,
                      });
                    }}
                  >
                    <Icon
                      style={{ cursor: "pointer" }}
                      icon={
                        boxStates.ratingInfo
                          ? "zi-chevron-up"
                          : "zi-chevron-down"
                      }
                    />
                  </span>
                </Box>
                {boxStates.ratingInfo && (
                  <Box>
                    <Box
                      height={1.5}
                      style={{ backgroundColor: "rgba(244, 245, 246, 1)" }}
                    ></Box>
                    <Box className="detail-container">
                      <Text
                        style={{
                          // color: "rgba(118, 122, 127, 1)",
                          fontWeight: 500,
                        }}
                      >
                        {res.data.rating_description
                          ? `${res.data.rating_description}`
                          : "Chưa có mô tả. Vui lòng đánh giá ticket"}
                      </Text>
                    </Box>
                  </Box>
                )}
              </Box>
              <Box
                mt={3}
                className="rating-container"
                flex
                flexDirection="row"
                alignContent="center"
                justifyContent="space-between"
              >
                <Box
                  onClick={() => {
                    setIsStarred(!isStarred);
                    if (isStarred) {
                      unfollowTicket(ticket.ticketid);
                    } else {
                      followTicket(ticket.ticketid);
                    }
                  }}
                >
                  <Box width={36}>
                    <Icon
                      icon={isStarred ? "zi-heart-solid" : "zi-heart"}
                      size={26}
                      style={{
                        color: isStarred
                          ? "rgba(220, 31, 24, 1)"
                          : "rgba(118, 122, 127, 1)",
                        cursor: "pointer",
                      }}
                    />
                  </Box>
                </Box>

                {!isTicketClosed && ticket.status === "Wait Close" && (
                  <>
                    <Button
                      variant="tertiary"
                      style={{
                        width: "42%",
                        borderRadius: "8px",
                        border: "1px rgba(0, 106, 245, 1) solid ",
                      }}
                      size="medium"
                      onClick={() => {
                        setShowReOpenModal(true);
                      }}
                    >
                      Mở lại
                    </Button>
                    <Button
                      style={{ width: "42%", borderRadius: "8px" }}
                      size="medium"
                      onClick={() => {
                        setShowRatingModal(true);
                      }}
                    >
                      Đánh giá
                    </Button>
                  </>
                )}

                {!isCusConfirm && ticket.status === "Wait For Verifying" && (
                  <>
                    <Button
                      variant="tertiary"
                      style={{
                        width: "42%",
                        borderRadius: "8px",
                        border: "1px rgba(0, 106, 245, 1) solid ",
                      }}
                      size="medium"
                      onClick={() => {
                        setShowCancelModal(true);
                      }}
                    >
                      Hủy
                    </Button>
                    <Button
                      style={{ width: "42%", borderRadius: "8px" }}
                      size="medium"
                      onClick={() => {
                        setShowConfirmModal(true);
                      }}
                    >
                      Xác nhận
                    </Button>
                  </>
                )}

                {!isTicketReopened &&
                  (isTicketClosed ||
                    isTicketCanceled ||
                    ticket.status === "Cancel" ||
                    ticket.status === "Closed") && (
                    <>
                      <Button
                        style={{
                          width: "88%",
                          borderRadius: "8px",
                        }}
                        size="medium"
                        onClick={() => {
                          setShowReOpenModal(true);
                        }}
                      >
                        Mở lại
                      </Button>
                    </>
                  )}

                {(!isTicketCanceled &&
                  ticket.status !== "Wait Close" &&
                  ticket.status !== "Closed" &&
                  ticket.status !== "Cancel" &&
                  ticket.status !== "Wait For Verifying") ||
                isTicketReopened ||
                isCusConfirm ? (
                  <Button
                    style={{
                      width: "85%",
                      borderRadius: "8px",
                    }}
                    size="medium"
                    onClick={() => {
                      // Xử lý khi ấn nút "Hủy"
                      setShowCancelModal(true);
                    }}
                  >
                    Hủy
                  </Button>
                ) : null}
              </Box>
            </Tabs.Tab>
            <Tabs.Tab
              key="tab2"
              label={
                <Box
                  flex
                  flexDirection="row"
                  justifyContent="center"
                  style={{ width: "180px", textAlign: "center" }}
                  onClick={() => setCurrentTab("tab2")}
                >
                  <Box pr={4} flex flexDirection="row" alignItems="center">
                    <Text
                      style={{
                        fontWeight: 500,
                        color:
                          currentTab === "tab2"
                            ? "rgba(0, 106, 245, 1)"
                            : "rgba(92, 94, 96, 1)",
                        fontSize: "17px",
                      }}
                    >
                      Bình luận
                    </Text>
                    <Box
                      ml={2}
                      className="length-ticket"
                      style={{
                        width: "20px",
                        background: "rgba(220, 31, 24, 1)",
                      }}
                    >
                      <Text
                        style={{
                          textAlign: "center",
                          color: "white",
                        }}
                      >
                        {commentCount}
                      </Text>
                    </Box>
                  </Box>
                </Box>
              }
              className="section-container"
            >
              {comments.map((comment) => (
                <div key={comment.modcommentsid}>
                  {comment.parent_comments === "0" && (
                    <Box className="comment-container" mb={2}>
                      <Box flexDirection="row" alignContent="center">
                        {comment.userid === "1847" ? (
                          <Avatar size={24} src={userInfo.avatar} />
                        ) : (
                          <Icon icon="zi-user-circle" />
                        )}

                        <Text bold style={{ paddingLeft: "6px" }}>
                          {comment.assigned_owners[0].name === "Zalo App"
                            ? contactData.data.full_name
                            : comment.assigned_owners[0].name}
                        </Text>
                        <Box style={{ flex: 1 }}></Box>
                        <Text style={{ fontSize: "13px" }}>
                          {getTimeAgo(comment.createdtime)}
                        </Text>
                      </Box>
                      <Text style={{ paddingTop: "6px" }}>
                        {comment.commentcontent.replace(
                          /\@\[Zalo App\]\(Users:\d+\)/,
                          ""
                        )}
                      </Text>
                      <Text
                        style={{
                          cursor: "pointer",
                          marginTop: "6px",
                          color: "rgba(0, 106, 245, 1)",
                        }}
                        onClick={() => setReplyToComment(comment.modcommentsid)}
                      >
                        Trả lời
                      </Text>
                      {comments.map((reply) => (
                        <div key={reply.modcommentsid}>
                          {reply.parent_comments === comment.modcommentsid && (
                            <Box className="comment-container" mb={0}>
                              <Box flexDirection="row" alignContent="center">
                                {reply.userid === "1847" ? (
                                  <Avatar size={24} src={userInfo.avatar} />
                                ) : (
                                  <Icon icon="zi-user-circle" />
                                )}
                                <Text
                                  bold
                                  style={{
                                    paddingLeft: "6px",
                                  }}
                                >
                                  {reply.assigned_owners[0].name === "Zalo App"
                                    ? contactData.data.full_name
                                    : reply.assigned_owners[0].name}
                                </Text>
                                <Box style={{ flex: 1 }}></Box>
                                <Text style={{ fontSize: "13px" }}>
                                  {getTimeAgo(reply.createdtime)}
                                </Text>
                              </Box>
                              <Text style={{ paddingTop: "6px" }}>
                                {reply.commentcontent.replace(
                                  /\@\[Zalo App\]\(Users:\d+\)/,
                                  ""
                                )}
                              </Text>
                              <Text
                                style={{
                                  cursor: "pointer",
                                  marginTop: "6px",
                                  color: "rgba(0, 106, 245, 1)",
                                }}
                                onClick={() =>
                                  setReplyToComment(reply.modcommentsid)
                                }
                              >
                                Trả lời
                              </Text>
                              {comments.map((moreReply) => (
                                <div key={moreReply.modcommentsid}>
                                  {moreReply.parent_comments ===
                                    reply.modcommentsid && (
                                    <Box mt={3}>
                                      <Box
                                        flexDirection="row"
                                        alignContent="center"
                                      >
                                        {moreReply.userid === "1847" ? (
                                          <Avatar
                                            size={24}
                                            src={userInfo.avatar}
                                          />
                                        ) : (
                                          <Icon icon="zi-user-circle" />
                                        )}
                                        <Text
                                          bold
                                          style={{
                                            paddingLeft: "6px",
                                          }}
                                        >
                                          {moreReply.assigned_owners[0].name ===
                                          "Zalo App"
                                            ? contactData.data.full_name
                                            : moreReply.assigned_owners[0].name}
                                        </Text>
                                        <Box style={{ flex: 1 }}></Box>
                                        <Text style={{ fontSize: "13px" }}>
                                          {getTimeAgo(moreReply.createdtime)}
                                        </Text>
                                      </Box>
                                      <Text style={{ paddingTop: "6px" }}>
                                        {moreReply.commentcontent.replace(
                                          /\@\[Zalo App\]\(Users:\d+\)/,
                                          ""
                                        )}
                                      </Text>
                                      <Text
                                        style={{
                                          cursor: "pointer",
                                          marginTop: "6px",
                                          color: "rgba(0, 106, 245, 1)",
                                        }}
                                        onClick={() =>
                                          setReplyToComment(reply.modcommentsid)
                                        }
                                      >
                                        Trả lời
                                      </Text>
                                    </Box>
                                  )}
                                </div>
                              ))}
                            </Box>
                          )}
                        </div>
                      ))}
                    </Box>
                  )}
                </div>
              ))}
              {!replyToComment ? (
                <div>
                  <Input.TextArea
                    autoFocus={true}
                    value={newComment}
                    onChange={(event) => setNewComment(event.target.value)}
                    maxLength={255}
                    showCount={true}
                  />
                  <Button
                    fullWidth
                    style={{ marginTop: "20px" }}
                    onClick={() => {
                      submitComment();
                      getCommentList();
                    }}
                  >
                    Gửi bình luận
                  </Button>
                </div>
              ) : (
                <div>
                  <Input.TextArea
                    autoFocus={true}
                    ref={commentInputRef}
                    value={newComment}
                    onChange={(event) => setNewComment(event.target.value)}
                  />
                  <Button
                    fullWidth
                    style={{ marginTop: "20px" }}
                    onClick={() => {
                      submitReply(replyToComment);
                      getCommentList();
                    }}
                  >
                    Trả lời bình luận
                  </Button>
                </div>
              )}
            </Tabs.Tab>
          </Tabs>
        </Box>

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

        <Modal
          visible={showRatingModal}
          // title="Đánh giá Ticket"
          onClose={() => {
            setShowRatingModal(false);
          }}
        >
          <Box alignContent="center">
            <Box
              onClick={() => {
                setShowRatingModal(false);
              }}
              style={{
                cursor: "pointer",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Icon icon="zi-close" size={24} />
            </Box>
            <Text
              bold
              size="xLarge"
              style={{ textAlign: "center", paddingBottom: "12px" }}
            >
              Đánh giá ticket
            </Text>
          </Box>
          <Text size="xSmall">
            Mời bạn đánh giá độ hài lòng của mình sau khi trải nghiệm dịch vụ
            chăm sóc khách hàng của My CloudGO
          </Text>
          <Text
            style={{
              color: "rgba(118, 122, 127, 1)",
              fontSize: "13px",
              textAlign: "center",
              paddingTop: "12px",
            }}
          >
            {ratingText}
          </Text>
          <Box mt={1} mb={3} flexDirection="row" justifyContent="center">
            {[1, 2, 3, 4, 5].map((value) => (
              <div
                onClick={() => {
                  handleRatingChange(value);
                  console.log(value);
                }}
                key={value}
                style={{ marginLeft: "8px", marginRight: "8px" }}
              >
                <Icon
                  icon={
                    value <= Number(newRating.helpdesk_rating)
                      ? "zi-star-solid"
                      : "zi-star"
                  }
                  size={20}
                  style={{
                    cursor: "pointer",
                    color:
                      value <= Number(newRating.helpdesk_rating)
                        ? "gold"
                        : "grey",
                  }}
                />
              </div>
            ))}
          </Box>

          <Input.TextArea
            label="Mô tả đánh giá"
            value={newRating.rating_description}
            placeholder="Nhập mô tả"
            onChange={(e) => {
              setNewRating((prevTicket) => ({
                ...prevTicket,
                rating_description: e.target.value,
              }));
            }}
            clearable
          />
          <Button
            fullWidth
            style={{ marginTop: "20px" }}
            onClick={() => {
              ratingTicket();
              setShowRatingModal(false);
              setNewRating(initialTicketState);
              setRatingText("(Chọn để đánh giá)");
              setIsTicketClosed(true);
            }}
          >
            Gửi đánh giá
          </Button>
        </Modal>

        <Modal
          visible={showReOpenModal}
          onClose={() => {
            setShowReOpenModal(false);
          }}
        >
          <Box alignContent="center">
            <Box
              onClick={() => {
                setShowReOpenModal(false);
              }}
              style={{
                cursor: "pointer",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Icon icon="zi-close" size={24} />
            </Box>
            <Text
              bold
              size="xLarge"
              style={{ textAlign: "center", paddingBottom: "12px" }}
            >
              Mở lại ticket
            </Text>
          </Box>
          <Text size="xSmall" style={{ paddingBottom: "20px" }}>
            Chúng tôi mong muốn được lắng nghe ý kiến của bạn. Mọi góp ý của bạn
            đều rất giá trị. Chúng tôi sẽ tiếp tục nỗ lực để phục vụ bạn tốt hơn
            nữa.
          </Text>

          <Input.TextArea
            label="Mô tả lí do"
            value={newRating.rating_description}
            placeholder="Nhập mô tả"
            onChange={(e) => {
              setNewRating((prevTicket) => ({
                ...prevTicket,
                rating_description: e.target.value,
              }));
            }}
            clearable
          />
          <Button
            fullWidth
            style={{ marginTop: "20px" }}
            onClick={() => {
              reOpenTicket();
              setShowReOpenModal(false);
              setIsTicketReopened(true);
              setIsTicketClosed(true);
            }}
          >
            Mở lại ticket
          </Button>
        </Modal>

        <Modal
          visible={showCancelModal}
          onClose={() => {
            setShowCancelModal(false);
          }}
        >
          <img
            style={{
              width: "80px",
              height: "80px",
              display: "block",
              margin: "0 auto",
            }}
            src="https://clipart-library.com/images/gTe5bLznc.gif"
          />
          <Text
            style={{
              textAlign: "center",
              paddingBottom: "12px",
              fontWeight: 500,
              paddingTop: "12px",
              fontSize: "22px",
            }}
          >
            Hủy ticket
          </Text>
          <Text
            style={{
              color: "rgba(118, 122, 127, 1)",
              fontWeight: 500,
              textAlign: "initial",
            }}
          >
            Bạn có chắc chắn hủy ticket {res.data.ticket_no} không?
          </Text>

          <Box flex>
            <Button
              fullWidth
              variant="tertiary"
              size="medium"
              style={{
                marginTop: "20px",
                borderRadius: "8px",
                border: "1px rgba(0, 106, 245, 1) solid ",
              }}
              onClick={() => {
                setShowCancelModal(false);
              }}
            >
              Quay lại
            </Button>
            <Box width={10} />
            <Button
              fullWidth
              size="medium"
              style={{
                marginTop: "20px",
                borderRadius: "8px",
                backgroundColor: "rgba(0, 106, 245, 1)",
              }}
              onClick={() => {
                cancelTicket();
                setShowCancelModal(false);
                setIsTicketCanceled(true);
              }}
            >
              Hủy
            </Button>
          </Box>
        </Modal>

        <Modal
          visible={showConfirmModal}
          onClose={() => {
            setShowConfirmModal(false);
          }}
        >
          <img
            style={{
              width: "80px",
              height: "80px",
              display: "block",
              margin: "0 auto",
            }}
            src="https://clipart-library.com/images/gTe5bLznc.gif"
          />
          <Text
            style={{
              textAlign: "center",
              paddingBottom: "12px",
              fontWeight: 500,
              paddingTop: "12px",
              fontSize: "22px",
            }}
          >
            Xác nhận ticket
          </Text>
          <Text
            style={{
              color: "rgba(118, 122, 127, 1)",
              fontWeight: 500,
              textAlign: "initial",
            }}
          >
            Bạn có muốn xác nhận ticket {res.data.ticket_no} không?
          </Text>

          <Box flex>
            <Button
              fullWidth
              variant="tertiary"
              size="medium"
              style={{
                marginTop: "20px",
                borderRadius: "8px",
                border: "1px rgba(0, 106, 245, 1) solid ",
              }}
              onClick={() => {
                setShowConfirmModal(false);
              }}
            >
              Quay lại
            </Button>
            <Box width={10} />
            <Button
              fullWidth
              size="medium"
              style={{
                marginTop: "20px",
                borderRadius: "8px",
                backgroundColor: "rgba(0, 106, 245, 1)",
              }}
              onClick={() => {
                confirmTicket();
                setShowConfirmModal(false);
                setIsCusConfirm(true);
              }}
            >
              Xác nhận
            </Button>
          </Box>
        </Modal>
      </Page>
    </PullToRefresh>
  );
};

export default DetailTicketPage;

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
  "Wait Close": "Đã xong, chờ đóng",
  Cancel: "Hủy",
  "Customer Confirmed": "KH đã xác nhận",
  "Sent Confirm Email": " Đã gửi email xác nhận",
  Reject: "Từ chối",
};
const translationCategory = {
  Bug: "Báo lỗi",
  Feedback: "Góp ý",
};

const translationSubCategory = {
  customer: "Khách hàng",
  product: "Sản phẩm",
  campaign_mktlist: "Chiến dịch, Marketing list",
  potential_quote_salesorder_invoice: "Cơ hội, Báo giá, Đơn hàng, Hoá đơn",
  receipt_payment: "Phiếu thu, Phiếu chi",
  dashboard_report: "Trang chủ, Báo cáo",
  zalochat_chatbot: "ChatZalo, ChatBot",
  filter_search: "Bộ lọc, Tìm kiếm",
  calendar_task_project: "Lịch làm việc, Công việc, Dự án",
  callcenter: "Tổng đài",
  email_sms_zns: "Email, SMS, ZNS",
  ticket_faq: "Ticket, Kho kiến thức",
  admin: "Admin (Phân quyền, cấu hình)",
  request_feature: "Yêu cầu bổ sung tính năng",
  request_consulting: "Yêu cầu tư vấn",
  staff_feedback: "Góp ý nhân viên",
  application_performance: "Tốc độ phần mềm",
  uiux: "Trải nghiệm người dùng, bố cục, giao diện",
  other: "Khác",
};
