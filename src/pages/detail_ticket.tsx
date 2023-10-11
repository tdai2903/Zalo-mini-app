import React, { useEffect, useState } from "react";
import { Button, Input, Box, Page, Text, Icon, Tabs, Modal } from "zmp-ui";
import { onConfirmToExit, offConfirmToExit, closeApp } from "zmp-sdk/apis";
import { useLocation, useNavigate } from "react-router";
import axios from "axios";
import { configAppView } from "zmp-sdk/apis";
import { CommentType } from "../type";
const DetailTicketPage: React.FunctionComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const ticket = location.state;
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showReOpenModal, setShowReOpenModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const token = localStorage.getItem("token");
  const [isStarred, setIsStarred] = useState(ticket.starred === "1");
  const [rating, setRating] = useState<number>(ticket.rating || 0);
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
  const images: File[] = ticket.images;

  const configView = async () => {
    try {
      await configAppView({
        headerColor: "#1843EF",
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
      contact_email: "",
      contact_mobile: "",
      solution: "",
      helpdesk_subcategory: "",
      imagename: "",
      imagename_path: "",
    },
  });

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
          "https://pms-dev.cloudpro.vn/api/SalesAppApi.php",
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
          console.log("Call api GetDetailTicket thành công:", response.data);
          const json = response.data;
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

  const getCommentList = async () => {
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      if (token !== null) {
        headers["token"] = token;
      }
      const apiUrl = "https://pms-dev.cloudpro.vn/api/SalesAppApi.php";

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
        console.log("Danh sách bình luận:", response.data.entry_list);
        const json = response.data.entry_list;
        setComments(json);
        return response.data;
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
        console.log("Gửi bình luận thành công:", response.data);
      })
      .catch((error) => {
        console.error("Lỗi khi gửi bình luận:", error);
      });
  };

  const replyComment = () => {
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
        console.log("Gửi bình luận thành công:", response.data);
      })
      .catch((error) => {
        console.error("Lỗi khi gửi bình luận:", error);
      });
  };

  useEffect(() => {
    detailTickets();
    getCommentList();
    configView();
    onConfirmToExit(() => setConfirmModalVisible(true));
    return () => offConfirmToExit();
  }, []);

  const handleRatingChange = (value) => {
    setRating(value);
    // Cập nhật văn bản tương ứng với số sao được chọn
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
    <Page className="page" hideScrollbar={true}>
      <Box className="section-container">
        <Box>
          <Text
            style={{
              paddingLeft: "4px",
              fontWeight: "bold",
              lineHeight: "18px",
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
        >
          <Box mt={2} flex flexDirection="row" alignContent="center">
            <Box>
              {[1, 2, 3, 4, 5].map((value) => (
                <Icon
                  key={value}
                  icon={value <= rating ? "zi-star-solid" : "zi-star"}
                  size={18}
                  style={{
                    color: value <= rating ? "gold" : "rgba(20, 20, 21, 1)",
                    marginLeft: "2px",
                  }}
                />
              ))}
            </Box>
            <Box ml={2} mr={2}>
              |
            </Box>
            <Text size="large">{res.data.ticket_no}</Text>
          </Box>
          <Box
            width={100}
            mt={2}
            flex
            flexDirection="row"
            alignContent="center"
            justifyContent="space-between"
          >
            <span
              onClick={() => {
                navigate(`/edit_ticket?id=${ticket.ticketid}`);
              }}
            >
              <Icon
                icon="zi-edit"
                style={{ color: "rgba(118, 122, 127, 1)", cursor: "pointer" }}
                size={24}
              ></Icon>
            </span>
            <Icon
              icon="zi-copy"
              style={{ color: "rgba(118, 122, 127, 1)", cursor: "pointer" }}
              size={24}
            ></Icon>
            <Icon
              icon="zi-share-external-2"
              style={{ color: "rgba(0, 106, 245, 1)", cursor: "pointer" }}
              size={24}
            ></Icon>
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
              backgroundColor: statusColors[ticket.status],
              display: "inline-block",
              minWidth: "20%",
              textAlign: "center",
              padding: "4px 8px",
              borderRadius: "16px",
            }}
          >
            <Text style={{ color: statusTextColors[ticket.status] }}>
              {translationStatus[ticket.status]}
            </Text>
          </Box>
          <Text>{res.data.createdtime}</Text>
        </Box>
      </Box>
      <Box mt={2}>
        <Tabs id="contact-list">
          <Tabs.Tab key="tab1" label="Bình luận" className="section-container">
            {comments.map((comment) => (
              <div key={comment.modcommentsid}>
                <Box className="comment-container" mb={2}>
                  <Box flexDirection="row" alignContent="center">
                    <Icon icon="zi-user-circle" size={24}></Icon>
                    <Text bold style={{ paddingLeft: "6px", fontSize: "13px" }}>
                      User name
                    </Text>
                    <Text style={{ paddingLeft: "6px", fontSize: "11px" }}>
                      - Chăm sóc khách hàng
                    </Text>
                    <Box width="12%"></Box>
                    <Text style={{ fontSize: "11px" }}>1 giờ trước</Text>
                  </Box>
                  <Text style={{ paddingTop: "6px" }}>
                    {comment.commentcontent}
                  </Text>
                  <Text
                    style={{
                      cursor: "pointer",
                      marginTop: "6px",
                      color: "rgba(0, 106, 245, 1)",
                    }}
                  >
                    Trả lời
                  </Text>
                </Box>
              </div>
            ))}
            <div>
              <Input.TextArea
                value={newComment}
                onChange={(event) => setNewComment(event.target.value)}
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
          </Tabs.Tab>
          <Tabs.Tab key="tab2" label="Chi tiết">
            <Box className="section-container">
              <Box
                flex
                flexDirection="row"
                justifyContent="space-between"
                height={50}
              >
                <Text style={{ fontSize: "Large", fontWeight: "bold" }}>
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
                      boxStates.ticketInfo ? "zi-chevron-up" : "zi-chevron-down"
                    }
                  />
                </span>
              </Box>

              {boxStates.ticketInfo && (
                <Box flexDirection="column">
                  <Box mb={3}>
                    <Text size="large">Mã Ticket</Text>
                    <Text size="large" bold>
                      {res.data.ticket_no}
                    </Text>
                  </Box>
                  <Box mb={3}>
                    <Text size="large">Tiêu đề</Text>
                    <Text size="large" bold>
                      {res.data.ticket_title}
                    </Text>
                  </Box>
                  <Box mb={3}>
                    <Text size="large">Danh mục</Text>
                    <Text size="large" bold>
                      {translationCategory[res.data.ticketcategories]}
                    </Text>
                  </Box>
                  <Box mb={3}>
                    <Text size="large">Chi tiết danh mục</Text>
                    <Text size="large" bold>
                      {translationSubCategory[res.data.helpdesk_subcategory]}
                    </Text>
                  </Box>
                  <Box>
                    <Text size="large">Tình trạng</Text>
                    <Text size="large" bold>
                      {translationStatus[res.data.ticketstatus]}
                    </Text>
                  </Box>
                </Box>
              )}
            </Box>

            <Box mt={2} className="section-container">
              <Box
                height={50}
                flex
                flexDirection="row"
                justifyContent="space-between"
              >
                <Text style={{ fontSize: "Large", fontWeight: "bold" }}>
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
                <div>
                  <Text size="large">Số điện thoại</Text>
                  <Text size="large" bold>
                    {res.data.contact_mobile}
                  </Text>
                  <Text size="large" style={{ paddingTop: "6px" }}>
                    Email
                  </Text>
                  <Text size="large" bold>
                    {res.data.contact_email}
                  </Text>
                </div>
              )}
            </Box>
            <Box mt={2} className="section-container">
              <Box
                height={50}
                flex
                flexDirection="row"
                justifyContent="space-between"
              >
                <Text style={{ fontSize: "Large", fontWeight: "bold" }}>
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
                  <Text size="large">Mô tả</Text>
                  <Text size="large" bold>
                    {res.data.description}
                  </Text>
                </Box>
              )}
            </Box>

            <Box mt={2} className="section-container">
              <Box
                height={50}
                flex
                flexDirection="row"
                justifyContent="space-between"
              >
                <Text style={{ fontSize: "Large", fontWeight: "bold" }}>
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
                      boxStates.imagesInfo ? "zi-chevron-up" : "zi-chevron-down"
                    }
                  />
                </span>
              </Box>
              <img
                src={"https://pms-dev.cloudpro.vn/" + res.data.imagename_path}
                alt="Hình ảnh"
              />
            </Box>
            <Box mt={2} className="section-container">
              <Box
                height={50}
                flex
                flexDirection="row"
                justifyContent="space-between"
              >
                <Text style={{ fontSize: "Large", fontWeight: "bold" }}>
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
                  <Text size="large">Giải pháp</Text>
                  <Text size="large" bold>
                    {res.data.solution}
                  </Text>
                </Box>
              )}
            </Box>

            <Box mt={2} className="section-container">
              <Box
                height={50}
                flex
                flexDirection="row"
                justifyContent="space-between"
              >
                <Text style={{ fontSize: "Large", fontWeight: "bold" }}>
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
                      boxStates.ratingInfo ? "zi-chevron-up" : "zi-chevron-down"
                    }
                  />
                </span>
              </Box>
              {boxStates.ratingInfo && (
                <div>
                  <Box
                    mt={4}
                    flex
                    flexDirection="row"
                    alignContent="center"
                    justifyContent="space-between"
                  >
                    <Box>
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Icon
                          key={value}
                          icon={value <= rating ? "zi-star-solid" : "zi-star"}
                          size={20}
                          style={{
                            color:
                              value <= rating ? "gold" : "rgba(20, 20, 21, 1)",
                            marginLeft: "2px",
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                  <Text
                    size="small"
                    style={{ padding: "4px", color: "rgba(20, 20, 21, 1)" }}
                  >
                    {note
                      ? `${note}`
                      : reason
                      ? `${reason}`
                      : "Chưa có mô tả. Vui lòng đánh giá ticket"}
                  </Text>
                </div>
              )}
            </Box>
            <Box
              mt={1}
              className="section-container"
              flex
              flexDirection="row"
              alignContent="center"
              justifyContent="space-between"
            >
              <div
                onClick={() => {
                  setIsStarred(!isStarred);
                  if (isStarred) {
                    unfollowTicket(ticket.ticketid);
                  } else {
                    followTicket(ticket.ticketid);
                  }
                }}
              >
                <Icon
                  icon={isStarred ? "zi-heart-solid" : "zi-heart"}
                  size={30}
                  style={{
                    color: isStarred ? "red" : "grey",
                    cursor: "pointer",
                  }}
                />
              </div>

              <Button
                style={{ width: "150px" }}
                size="medium"
                disabled={ticket.status !== "Closed"}
                onClick={() => {
                  setShowReOpenModal(true);
                }}
              >
                Mở lại
              </Button>
              <Button
                style={{ width: "150px" }}
                size="medium"
                onClick={() => {
                  setShowRatingModal(true);
                }}
                disabled={
                  ticket.status !== "Open" &&
                  ticket.status !== "Assigned" &&
                  ticket.status !== "In Progress"
                }
              >
                Đánh giá
              </Button>
            </Box>
          </Tabs.Tab>
        </Tabs>
      </Box>

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
            },
          },
        ]}
      />

      <Modal
        visible={showRatingModal}
        title="Đánh giá Ticket"
        onClose={(val) => {
          console.log(val), setShowRatingModal(false);
        }}
      >
        <Text size="xSmall">
          Mời bạn đánh giá độ hài lòng của mình sau khi trải nghiệm dịch vụ chăm
          sóc khách hàng của My CloudGO
        </Text>
        <Text
          style={{
            color: "rgba(118, 122, 127, 1)",
            textAlign: "center",
            paddingTop: "4px",
          }}
        >
          {ratingText}
        </Text>
        <Box mt={3} mb={3} flexDirection="row" justifyContent="space-around">
          {[1, 2, 3, 4, 5].map((value) => (
            <div
              onClick={() => {
                handleRatingChange(value);
                console.log(value);
              }}
              key={value}
            >
              <Icon
                icon={value <= rating ? "zi-star-solid" : "zi-star"}
                size={24}
                style={{
                  cursor: "pointer",
                  color: value <= rating ? "gold" : "grey",
                }}
              />
            </div>
          ))}
        </Box>
        <Input.TextArea
          label="Mô tả đánh giá"
          value={note}
          placeholder="Nhập mô tả"
          onChange={(event) => {
            setNote(event.target.value);
          }}
          clearable
        />
        <Button
          fullWidth
          style={{ marginTop: "20px" }}
          onClick={() => {
            setShowRatingModal(false);
          }}
        >
          Gửi đánh giá
        </Button>
      </Modal>

      <Modal
        visible={showReOpenModal}
        title="Mở lại Ticket"
        onClose={() => {
          setShowRatingModal(false);
        }}
      >
        <Text size="xSmall">
          Chúng tôi mong muốn được lắng nghe ý kiến của bạn. Mọi góp ý của bạn
          đều rất giá trị. Chúng tôi sẽ tiếp tục nỗ lực để phục vụ bạn tốt hơn
          nữa.
        </Text>

        <Input.TextArea
          label="Mô tả lí do"
          value={reason}
          placeholder="Nhập mô tả"
          onChange={(event) => {
            setReason(event.target.value);
          }}
          clearable
        />
        <Button
          fullWidth
          style={{ marginTop: "20px" }}
          onClick={() => {
            setShowReOpenModal(false);
            detailTickets();
          }}
        >
          Mở lại ticket
        </Button>
      </Modal>
    </Page>
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
  other: "Khác",
};
