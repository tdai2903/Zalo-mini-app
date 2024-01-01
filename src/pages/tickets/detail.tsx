import React, { useEffect, useState, useRef, useCallback } from "react";
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
  Sheet,
} from "zmp-ui";
import { getSystemInfo, openOutApp } from "zmp-sdk";
import { openShareSheet, openWebview } from "zmp-sdk/apis";
import url_api from "../../const";
import ImageViewer from "react-simple-image-viewer";
import { useLocation, useNavigate } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import PullToRefresh from "react-simple-pull-to-refresh";
import axios from "axios";
import { CommentType, RatingType } from "../../type";
import { useService } from "../../functions/common";

const DetailTicketPage: React.FunctionComponent = () => {
  /**
   * Sử dụng function follow từ common.ts
   */
  const { followTicket } = useService();
  const location = useLocation(); 
  const navigate = useNavigate(); 
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const { openSnackbar } = useSnackbar();
  const ticket = location.state;
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const Detail = JSON.parse(localStorage.getItem("detail_ticket") || "{}");
  const [lineClamp, setLineClamp] = useState(3);
  const [pickImage, setPickImage] = useState(0);
  const [isPickImage, setIsPickImage] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [imagesComment, setImagesComment] = useState(0);
  const [isViewerOpenComment, setIsViewerOpenComment] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedComment, setSelectedComment] = useState<string | null>(null);
  const [selectedImagesComment, setSelectedImagesComment] = useState(null);
  const [visibleImages, setVisibleImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
  const [sheetVisible, setSheetVisible] = useState(false);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [currentTab, setCurrentTab] = useState("tab1");
  const [comments, setComments] = useState<CommentType[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [replyToComment, setReplyToComment] = useState<string | null>(null);
  const token = localStorage.getItem("token");
  const [isStarred, setIsStarred] = useState(ticket.starred === "1");
  const [ratingText, setRatingText] = useState("(Chọn để đánh giá)");
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
  const { configView, setLeftButton } = useService();
  const initialCommentState: CommentType = {
    related_to: "",
    commentcontent: "",
    modcommentsid: "",
    parent_comments: "",
    createdtime: "",
    assigned_owners: [],
    filename: [],
    file: [],
    path: "",
    name: "",
    userid: "",
    id: "",
  };

  /**
   * State color icon khi đánh giá
   */
  const [colors, setColors] = useState({
    1: "rgba(118, 122, 127, 1)",
    2: "rgba(118, 122, 127, 1)",
    3: "rgba(118, 122, 127, 1)",
    4: "rgba(118, 122, 127, 1)",
    5: "rgba(118, 122, 127, 1)",
  });

  const [selectedColor, setSelectedColor] = useState(null);

  /**
   * Thay đổi state color khi click vào từng icon đánh giá
   */
  const handleClick = (value) => {
    let newColor;
    switch (value) {
      case 1:
        newColor = "rgba(18, 174, 226, 1)";
        break;
      case 2:
        newColor = "rgba(222, 100, 13, 1)";
        break;
      case 3:
        newColor = "rgba(52, 183, 100, 1)";
        break;
      case 4:
        newColor = "rgba(253, 217, 73, 1)";
        break;
      case 5:
        newColor = "rgba(232, 186, 2, 1)";
        break;
      default:
        newColor = "rgba(118, 122, 127, 1)";
    }

    setColors((prevColors) => ({
      ...prevColors,
      [value]: newColor,
    }));
    setSelectedColor(value);
  };

  const [newComment, setNewComment] = React.useState<CommentType>({
    ...initialCommentState,
  });

  /**
   * Preview image khi click vào hình ảnh ở thông tin hình ảnh
   */
  const openImageViewers = useCallback((index) => {
    setCurrentImage(index);
    setIsViewerOpen(true);
  }, []);

  /**
   * Close preview image
   */
  const closeImageViewers = () => {
    setCurrentImage(0);
    setIsViewerOpen(false);
  };

  /**
   * Preview image từ comment ticket
   */
  const openImageViewer = useCallback((index, comment) => {
    setImagesComment(index);
    setIsViewerOpenComment(true);
    setSelectedImagesComment(comment);
    console.log("đã gọi imageviewer comment");
  }, []);

  /**
   * Close preview image ở comment ticket
   */
  const closeImageViewer = () => {
    setImagesComment(0);
    setIsViewerOpenComment(false);
  };

  /**
   * Preview image ở comment ticket khi upload hình ảnh
   */
  const openPicker = useCallback((index) => {
    setPickImage(index);
    setIsPickImage(true);
  }, []);

  /**
   * Close preview image ở comment ticket khi upload hình ảnh
   */
  const closePicker = () => {
    setPickImage(0);
    setIsPickImage(false);
  };

  /**
   * Data list image truyền vào ImageForViewer ở chi tiết hình ảnh
   */
  const listImages = Detail.data?.imagename_path
    ? Object.entries(Detail.data?.imagename_path).map(
        ([id, path]) => `https://pms-dev.cloudpro.vn${path}`
      )
    : [];

  /**
   * Mở open webview khi click vào files
   * nếu là android thì sẽ download về
   */
  const openUrlInWebview = async (imagePath) => {
    try {
      if (getSystemInfo().platform === "android") {
        openOutApp({
          url: `https://pms-dev.cloudpro.vn/${imagePath}`,
        });
      } else {
        await openWebview({
          url: `https://pms-dev.cloudpro.vn/${imagePath}`,
          config: {
            style: "bottomSheet",
            leftButton: "back",
          },
        });
      }
    } catch (error) {
      // xử lý khi gọi api thất bại
      console.log(error);
    }
  };

  /**
   * Mở open webview khi click vào files ở comments
   */
  const openwebviewcomment = async (filePath) => {
    try {
      if (getSystemInfo().platform === "android") {
        openOutApp({
          url: filePath,
        });
      } else {
        await openWebview({
          url: filePath,
          config: {
            style: "bottomSheet",
            leftButton: "back",
          },
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Gọi API share current page từ zalo
   */
  const shareCurrentPage = async () => {
    try {
      const description = `Tiêu đề Ticket: ${res.data.ticket_no} \n ${res.data.ticket_title}`;
      const data = await openShareSheet({
        type: "zmp_deep_link",
        data: {
          title: "My Zalo Mini App - My Account",
          description: description,
          thumbnail:
            "https://images.glints.com/unsafe/glints-dashboard.s3.amazonaws.com/company-logo/7dfb852dfdf250030688f757f4f168bf.png",
          path: `${location.pathname}${location.search}`,
        },
      });
      console.log("share ");
      console.log(location);
    } catch (err) {}
  };

  useEffect(() => {
    handleRefresh();
    configView("Chi tiết ticket", "back");
    setLeftButton("back");
  }, []);

  /**
   * set res state để sử dụng data từ api get detail ticket từ pms-dev
   */
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
      createedby: "",
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
      url: "",
      parent_name: "",
      modifiedby: "",
      createdby: "",
    },
  });

  /**
   * API get detail ticket
   * @param ticketid
   * @returns array data
   */
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
          setIsRefreshing(false);
          setIsLoading(false);
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

  /**
   * API update ticket status
   * gọi hàm này update status ticket => Reopen
   * @param ticket_id | ticketstatus | rating_description
   */
  const updateStatus = (status) => {
    openSnackbar({
      text: "Đang tiến hành",
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
            ticketstatus: status,
            rating_description: newRating.rating_description,
          },
        }),
        {
          headers: headers,
        }
      )
      .then((response) => {
        openSnackbar({
          text: "Đã xong",
          type: "success",
        });
        detailTickets();
        setNewRating(initialTicketState);
      })
      .catch((error) => {
        console.error("Lỗi khi đánh giá:", error);
      });
  };

  /**
   * API rating ticket
   * sau khi rating ticket status ticket => Closed
   * @param ticket_id | rating | rating_description
   */
  const ratingTicket = () => {
    /*
     * hiển thị alert khi đang trong quá trình đánh giá ticket
     */
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
        rating_description: newRating.rating_description || "",
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
        /**
         * hiển thị alert sau khi đánh giá thành công
         */
        openSnackbar({
          text: "Đã đánh giá ticket",
          type: "success",
        });
        /**
         * gọi lại api get detail ticket
         * nếu rating 1 và 2 sao thì auto gọi api create ticket để tạo ticket nội bộ
         */
        detailTickets();
        if (newRating.helpdesk_rating >= 1 && newRating.helpdesk_rating <= 2) {
          createNewTicket(
            newRating.helpdesk_rating,
            newRating.rating_description
          );
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  /**
   * Gọi api create ticket nội bộ khi đánh giá ticket 1 và 2 sao
   * truyền vào data tương ứng và set mức độ ticket là High
   * trạng thái ticket Open,
   */
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
          ticket_title: Detail.data.ticket_title || "",
          ticketpriorities: "High",
          ticketstatus: "Open",
          ticketcategories: Detail.data.ticketcategories || "",
          description: Detail.data.description || "",
          helpdesk_subcategory: Detail.data.helpdesk_subcategory || "",
          contact_name: Detail.data.contact_name || "",
          contact_mobile: Detail.data.contact_mobile || "",
          contact_id: Detail.data.id || "",
          contact_email: Detail.data.contact_email || "",
          solution: Detail.data.solution || "",
          url: Detail.data.url || "",
          ticketseverities: "Critical",
          helpdesk_customer_group: "Internal",
          helpdesk_rating: helpdesk_rating || "",
          rating_description: rating_description || "",
          assigned_user_id: "Users:211,Users:1",
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
          console.log(
            "Đã tạo ticket nội bộ",
            JSON.stringify(response.data.data)
          );
        })
        .catch((error) => {
          console.log("Lỗi khi tạo ticket nội bộ", error);
        });
    } catch (error) {
      if (error === "SyntaxError: Unexpected token T in JSON at position 0") {
        navigate("/");
      }
    }
  };

  /**
   * Api Get comment list từ pms
   * @param module | record_related_id
   * @returns array list comment
   */
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
        const listComment = response.data.data.entry_list;

        /**
         * set state để hứng list comment đó
         */
        setComments(listComment);
        setCommentCount(listComment.length);
        handleSendComment();
        return response.data.data;
      } else {
        return null;
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  /**
   * Gọi api submit comment
   * @param commentcontent | assigned_user_id | related_to | parent_comments | filename
   */
  const submitComment = () => {
    if (!newComment.commentcontent) {
      console.log("Nội dung bình luận không được trống");
      return;
    }
    /**
     * hiển thị alert đang gửi comment
     */
    openSnackbar({
      text: "Đang gửi bình luận...",
      type: "loading",
      duration: 5000,
    });

    const formData = new FormData();
    formData.append("RequestAction", "create");
    formData.append("Module", "ModComments");
    formData.append("Data[commentcontent]", newComment.commentcontent);
    formData.append("Data[assigned_user_id]", "1847");
    formData.append("Data[related_to]", ticket.ticketid);
    formData.append("Data[parent_comments]", "");
    formData.append("Data[userid]", "1847");
    formData.append("filename", newComment.filename[0]);

    const headers = {
      "Content-Type": "multipart/form-data",
    };

    if (token !== null) {
      headers["token"] = token;
    }

    axios
      .post("https://pms-dev.cloudpro.vn/api/CloudWorkApi.php", formData, {
        headers: headers,
      })
      .then((response) => {
        console.log("Gửi bình luận thành công:", response.data.data);
        /**
         * Gọi lại api get list comment khi submit comment mới
         */
        getCommentList();
        /**
         * hiển thị alert khi comment thành công
         */
        openSnackbar({
          text: "Đã gửi bình luận",
          type: "success",
          duration: 1000,
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

    const formData = new FormData();
    formData.append("RequestAction", "create");
    formData.append("Module", "ModComments");
    formData.append("Data[commentcontent]", newComment.commentcontent);
    formData.append("Data[assigned_user_id]", "1847");
    formData.append("Data[related_to]", ticket.ticketid);
    formData.append("Data[parent_comments]", comment);
    formData.append("Data[userid]", "1847");
    formData.append("filename", newComment.filename[0]);

    const headers = {
      "Content-Type": "multipart/form-data",
    };

    if (token !== null) {
      headers["token"] = token;
    }

    axios
      .post("https://pms-dev.cloudpro.vn/api/CloudWorkApi.php", formData, {
        headers: headers,
      })
      .then((response) => {
        console.log("Gửi bình luận trả lời thành công:", response.data.data);
        setNewComment((prevComment) => ({
          ...prevComment,
          commentcontent: "",
        }));

        getCommentList();
        setReplyToComment(null);
        openSnackbar({
          text: "Đã gửi trả lời bình luận",
          type: "success",
          duration: 1000,
        });
      })
      .catch((error) => {
        console.error("Lỗi khi gửi bình luận trả lời:", error);
      });
  };

  /**
   * function get datetime
   */
  const getTimeAgo = (timestamp) => {
    const currentTime = new Date();
    const commentTime = new Date(timestamp);
    const timeDifference = currentTime.getTime() - commentTime.getTime();

    const minutes = Math.floor(timeDifference / 60000);
    console.log("hiện tại", currentTime);
    console.log(" comment hiện tại", commentTime);
    console.log("time", timeDifference);

    if (minutes < 1) {
      return "Vừa xong";
    } else if (minutes < 60) {
      console.log("phút", minutes);

      return `${minutes.toString()} phút trước`;
    } else {
      const hours = Math.floor(minutes / 60);

      if (hours < 24) {
        console.log("giờ", hours);

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

  // useEffect(() => {
  //   detailTickets();
  //   getCommentList();
  // }, []);

  /**
   * hàm reload detail ticket
   * gọi lại api getCommentList và detailTickets khi reload thành công
   */
  const handleReload = () => {
    console.log("reload");

    getCommentList();
    detailTickets();
  };

  /**
   * hàm refresh
   * gọi function reload khi refresh
   */
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setIsLoading(true);
    handleReload();
  };

  /**
   * state hiển thị text khi đánh giá ticket từ 1 đến 5 sao
   */
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

  /**
   * Function mở thư mục files
   */
  const handleIconClick = (commentId: string) => {
    setSelectedComment(commentId);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /**
   * Convert File thành src
   */
  function convertFilesToImageTypes(files: File[]) {
    return files.map((file) => ({ src: URL.createObjectURL(file) }));
  }

  /**
   * Check file là image hay là pdf or docs
   */
  const isImage = (file: File) => {
    return file.type.startsWith("image/");
  };
  const images = uploadedFiles.filter((file) => isImage(file));
  const files = uploadedFiles.filter((file) => !isImage(file));

  /**
   * lấy files lấy từ images
   */
  const imagesForViewer = convertFilesToImageTypes(images);

  /**
   * lấy src từ imagesForViewer để truyền vào src preview image
   */
  const imagePaths = imagesForViewer.map((image) => image.src);

  /**
   * Giới hạn chỉ upload 1 files
   */
  const maxFiles = 1;

  /**
   * Giới hạn chỉ upload 15MB
   */
  const maxFileSizeInBytes = 15 * 1024 * 1024;

  /**
   * Function upload files
   */
  const handleImageUpload = (files: FileList | null) => {
    if (files) {
      const selectedImagesArray = Array.from(files);
      console.log(files);
      // Kiểm tra kích thước của từng tệp trước khi thêm vào danh sách
      const filesWithinSizeLimit = selectedImagesArray.every(
        (file) => file.size <= maxFileSizeInBytes
      );

      if (!filesWithinSizeLimit) {
        // Hiển thị thông báo hoặc xử lý khi một hoặc nhiều tệp vượt quá kích thước giới hạn
        openSnackbar({
          text: `Kích thước tệp vượt quá giới hạn 15MB.`,
          type: "error",
        });
        return;
      }

      // Kiểm tra số lượng hình ảnh đã chọn
      if (selectedImagesArray.length + newComment.filename.length <= maxFiles) {
        // Cập nhật danh sách hình ảnh đã chọn
        setSelectedImages((prevSelectedImages) => [
          ...prevSelectedImages,
          ...selectedImagesArray,
        ]);

        setUploadedFiles((prevUploadedFiles) => [
          ...prevUploadedFiles,
          ...selectedImagesArray,
        ]);
        setNewComment((prevTicket) => ({
          ...prevTicket,
          filename: files ? [...files] : [],
        }));

        setNewComment((prevTicket) => ({
          ...prevTicket,
          filename: files,
        }));
      } else {
        // Hiển thị thông báo hoặc xử lý khi vượt quá giới hạn tệp
        openSnackbar({
          text: `Chỉ được tải lên tối đa ${maxFiles} hình ảnh và tệp.`,
          type: "error",
        });
      }
    }
  };

  /**
   * Function delete files khi đã upload files
   */
  const handleDeleteImage = (index) => {
    const updatedImages = [...selectedImages];
    updatedImages.splice(index, 1);
    setSelectedImages(updatedImages);

    const updatedUploadedFiles = [...uploadedFiles];
    updatedUploadedFiles.splice(index, 1);
    setUploadedFiles(updatedUploadedFiles);

    const updatedImagePaths = updatedImages.map((file) =>
      URL.createObjectURL(file)
    );
    setNewComment((prevTicket) => ({
      ...prevTicket,
      filename: updatedImagePaths,
    }));

    // Đóng hình ảnh khi người dùng xóa
    setVisible(false);

    if (index === activeIndex) {
      setActiveIndex(0);
    }
  };

  const handleSendComment = () => {
    setVisibleImages((prevVisibleImages) => [
      ...prevVisibleImages,
      selectedComment,
    ]);
  };

  return (
    <div style={{ overflowY: "auto", height: "100vh" }}>
      <PullToRefresh onRefresh={handleRefresh} refreshingContent={""}>
        <Page className="section-page" hideScrollbar={true}>
          {isLoading && (
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
          <Box className="title-detail-container">
            <Box alignItems="center" mb={1}>
              <Text
                style={{
                  fontWeight: 500,
                  fontSize: "16px",
                  lineHeight: "20px",
                  color: "rgba(20, 20, 21, 1)",
                }}
              >
                [{res.data.ticket_no}{" "}
                {translationCategory[res.data.ticketcategories]}]{" "}
                {res.data.ticket_title}
              </Text>
            </Box>
            <Text style={{ color: "rgba(54, 56, 58, 1)", fontSize: "14px" }}>
              Chi tiết danh mục:{" "}
              {translationSubCategory[res.data.helpdesk_subcategory]}
            </Text>
            <Box
              mt={2}
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
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
              <Text
                style={{ color: "rgba(118, 122, 127, 1)", fontSize: "14px" }}
              >
                {res.data.createdtime}
              </Text>
            </Box>
            <Box
              mt={3}
              mr={6}
              ml={6}
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box flexDirection="column">
                <Box
                  ml={1}
                  width={32}
                  height={32}
                  justifyContent="center"
                  alignItems="center"
                  style={{
                    borderRadius: "4px",
                    display: "flex",
                    border: "1px solid rgba(0, 106, 245, 1)",
                  }}
                  onClick={() => {
                    navigate(`/edit_ticket?id=${ticket.ticketid}`, {
                      state: {
                        ticket_title: res.data.ticket_title,
                        ticketcategories: res.data.ticketcategories,
                        helpdesk_subcategory: res.data.helpdesk_subcategory,
                        id: res.data.id,
                        contact_name: res.data.contact_name,
                        contact_mobile: res.data.contact_mobile,
                        contact_email: res.data.contact_email,
                        description: res.data.description,
                        url: res.data.url,
                      },
                    });
                  }}
                >
                  <Icon
                    icon="zi-edit"
                    style={{
                      color: "rgba(118, 122, 127, 1)",
                      cursor: "pointer",
                    }}
                    size={20}
                  ></Icon>
                </Box>
                <Text
                  style={{
                    fontSize: "10px",
                    marginTop: "2px",
                    textAlign: "center",
                  }}
                >
                  Chỉnh sửa
                </Text>
              </Box>
              <Box flexDirection="column">
                <Box
                  ml={1}
                  width={32}
                  height={32}
                  justifyContent="center"
                  alignItems="center"
                  style={{
                    borderRadius: "4px",
                    display: "flex",
                    border: "1px solid rgba(0, 106, 245, 1)",
                  }}
                >
                  <Box
                    onClick={() => {
                      setIsStarred(!isStarred);
                      if (isStarred) {
                        followTicket(ticket.ticketid, 0);
                      } else {
                        followTicket(ticket.ticketid, 1);
                      }
                    }}
                  >
                    <Icon
                      icon={isStarred ? "zi-star-solid" : "zi-star"}
                      style={{
                        color: isStarred ? "gold" : "rgba(118, 122, 127, 1)",
                        cursor: "pointer",
                      }}
                      size={20}
                    />
                  </Box>
                </Box>
                <Text
                  style={{
                    fontSize: "10px",
                    marginTop: "2px",
                    textAlign: "center",
                  }}
                >
                  Theo dõi
                </Text>
              </Box>
              <Box flexDirection="column">
                <Box
                  ml={1}
                  width={32}
                  height={32}
                  justifyContent="center"
                  alignItems="center"
                  style={{
                    borderRadius: "4px",
                    display: "flex",
                    border: "1px solid rgba(0, 106, 245, 1)",
                  }}
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
                        url: res.data.url,
                      },
                    });
                  }}
                >
                  <Icon
                    icon="zi-copy"
                    style={{
                      color: "rgba(118, 122, 127, 1)",
                      cursor: "pointer",
                    }}
                    size={20}
                  ></Icon>
                </Box>
                <Text
                  style={{
                    fontSize: "10px",
                    marginTop: "2px",
                    textAlign: "center",
                  }}
                >
                  Nhân đôi
                </Text>
              </Box>
              <Box flexDirection="column">
                <Box
                  width={32}
                  height={32}
                  justifyContent="center"
                  alignItems="center"
                  style={{
                    borderRadius: "4px",
                    display: "flex",
                    border: "1px solid rgba(0, 106, 245, 1)",
                  }}
                  onClick={() => {
                    shareCurrentPage();
                  }}
                >
                  <Icon
                    icon="zi-share-external-2"
                    style={{
                      color: "rgba(118, 122, 127, 1)",
                      cursor: "pointer",
                    }}
                    size={20}
                  ></Icon>
                </Box>
                <Text
                  style={{
                    fontSize: "10px",
                    marginTop: "2px",
                    textAlign: "center",
                  }}
                >
                  Chia sẻ
                </Text>
              </Box>
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
                      <Box className="detail-container" flexDirection="column">
                        <Box mb={5}>
                          <Text
                            style={{
                              color: "rgba(118, 122, 127, 1)",
                            }}
                          >
                            Link cài đặt
                          </Text>
                          <Text style={{ fontWeight: 500, paddingTop: "2px" }}>
                            {res.data.url}
                          </Text>
                        </Box>
                        <Text
                          style={{
                            color: "rgba(118, 122, 127, 1)",
                          }}
                        >
                          Mô tả
                        </Text>

                        <Text
                          style={{
                            fontWeight: 500,
                            paddingTop: "2px",
                            whiteSpace: "pre-wrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitBoxOrient: "vertical",
                            WebkitLineClamp: lineClamp,
                            flex: 1,
                          }}
                        >
                          {res.data.description.replace(
                            /<br\s*\/?>|<p\s*\/?>|<strong[^>]*>[\s\S]*?<\/strong>/g,
                            ""
                          )}
                        </Text>
                        {res.data.description.split(/\r\n|\r|\n/).length >
                          3 && (
                          <span
                            style={{
                              color: "rgba(0, 106, 245, 1)",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              setSheetVisible(true);
                            }}
                          >
                            Xem thêm
                          </span>
                        )}
                        <Sheet
                          visible={sheetVisible}
                          onClose={() => setSheetVisible(false)}
                          autoHeight
                          mask
                          handler={false}
                          swipeToClose
                        >
                          <Box mt={4} ml={4} mb={2}>
                            <Text
                              style={{
                                fontWeight: 500,
                                fontSize: "17px",
                                paddingBottom: "20px",
                              }}
                            >
                              Mô tả
                            </Text>
                            <Box
                              style={{ overflowY: "auto", maxHeight: "50vh" }}
                            >
                              <Text
                                style={{
                                  color: "rgba(118, 122, 127, 1)",
                                  lineHeight: "20px",
                                }}
                              >
                                {res.data.description
                                  .split(/(<br\s*\/?>|\n)/)
                                  .map((item, index) => (
                                    <React.Fragment key={index}>
                                      {item === "<br />" || item === "\n" ? (
                                        <br />
                                      ) : (
                                        <span
                                          dangerouslySetInnerHTML={{
                                            __html: item.replace(
                                              /<strong[^>]*>([\s\S]*?)<\/strong>/g,
                                              "<b>$1</b>"
                                            ),
                                          }}
                                        />
                                      )}
                                    </React.Fragment>
                                  ))}
                              </Text>
                            </Box>
                          </Box>
                        </Sheet>
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
                          {Object.entries(res.data.imagename_path)
                            .slice(0, 3)
                            .map(([id, imagePath], index) => (
                              <div key={id} style={{ paddingRight: "6px" }}>
                                {imagePath.endsWith(".docx") ||
                                imagePath.endsWith(".pdf") ? (
                                  <img
                                    style={{
                                      height: "85px",
                                      width: "85px",
                                      cursor: "pointer",
                                    }}
                                    onClick={() =>
                                      openUrlInWebview([imagePath])
                                    }
                                    src={
                                      imagePath.endsWith(".docx")
                                        ? "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/.docx_icon.svg/2048px-.docx_icon.svg.png"
                                        : "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Pdf-2127829.png/600px-Pdf-2127829.png"
                                    }
                                    alt={`File ${index + 1}`}
                                  />
                                ) : (
                                  <img
                                    style={{
                                      height: "85px",
                                      width: "85px",
                                      objectFit: "contain",
                                      cursor: "pointer",
                                    }}
                                    onClick={() => openImageViewers(index)}
                                    src={`https://pms-dev.cloudpro.vn${imagePath}`}
                                    alt={`Hình ảnh ${index + 1}`}
                                  />
                                )}
                              </div>
                            ))}

                          {Object.entries(res.data.imagename_path).length >
                            4 && (
                            <div
                              style={{
                                position: "relative",
                                height: "85px",
                                width: "85px",
                                paddingRight: "6px",
                              }}
                              onClick={() => {
                                openImageViewers(3);
                              }}
                            >
                              <img
                                src={`https://pms-dev.cloudpro.vn${
                                  Object.entries(res.data.imagename_path)[3][1]
                                }`}
                                alt={`Hình ảnh 4`}
                                style={{
                                  width: "85px",
                                  height: "85px",
                                  background: "rgba(255, 255, 255, 0.7)",
                                  objectFit: "contain",
                                }}
                              />
                              <Box
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "85px",
                                  height: "85px",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  cursor: "pointer",
                                  background: "rgba(0, 0, 0, 0.3)",
                                  color: "white",
                                }}
                              >
                                +
                                {Object.entries(res.data.imagename_path)
                                  .length - 4}
                              </Box>
                            </div>
                          )}
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
                {isViewerOpen && (
                  <ImageViewer
                    src={listImages}
                    currentIndex={currentImage}
                    disableScroll={false}
                    closeOnClickOutside={true}
                    onClose={closeImageViewers}
                  />
                )}

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
                        <Text
                          style={{
                            fontWeight: 500,
                            paddingTop: "2px",
                            whiteSpace: "normal",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitBoxOrient: "vertical",
                            WebkitLineClamp: lineClamp,
                            flex: 1,
                          }}
                        >
                          {res.data.solution.replace(
                            /<br\s*\/?>|<p\s*\/?>|<strong[^>]*>[\s\S]*?<\/strong>/g,
                            ""
                          )}
                        </Text>
                        {res.data.solution.split(/\r\n|\r|\n/).length > 3 && (
                          <span
                            style={{
                              color: "rgba(0, 106, 245, 1)",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              setActionSheetVisible(true);
                            }}
                          >
                            Xem thêm
                          </span>
                        )}
                        <Sheet
                          visible={actionSheetVisible}
                          onClose={() => setActionSheetVisible(false)}
                          autoHeight
                          mask
                          handler={false}
                          swipeToClose
                        >
                          <Box mt={4} ml={4} mb={2}>
                            <Text
                              style={{
                                fontWeight: 500,
                                fontSize: "17px",
                                paddingBottom: "20px",
                              }}
                            >
                              Giải pháp
                            </Text>
                            <Box
                              style={{ overflowY: "auto", maxHeight: "50vh" }}
                            >
                              <Text
                                style={{
                                  color: "rgba(118, 122, 127, 1)",
                                  lineHeight: "20px",
                                }}
                              >
                                {res.data.solution
                                  .split(/(<br\s*\/?>|\n)/)
                                  .map((item, index) => (
                                    <React.Fragment key={index}>
                                      {item === "<br />" || item === "\n" ? (
                                        <br />
                                      ) : (
                                        <span
                                          dangerouslySetInnerHTML={{
                                            __html: item.replace(
                                              /<strong[^>]*>([\s\S]*?)<\/strong>/g,
                                              "<b>$1</b>"
                                            ),
                                          }}
                                        />
                                      )}
                                    </React.Fragment>
                                  ))}
                              </Text>
                            </Box>
                          </Box>
                        </Sheet>
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
                              display:
                                res.data.contact_mobile === "undefined"
                                  ? "none"
                                  : "block",
                            }}
                          >
                            {res.data.contact_mobile.replace(/^84/, "0")}
                          </Text>
                        </Box>
                        <Box mb={4}>
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
                              display:
                                res.data.contact_email === "undefined"
                                  ? "none"
                                  : "block",
                            }}
                          >
                            {res.data.contact_email}
                          </Text>
                        </Box>
                        <Box>
                          <Text
                            style={{
                              color: "rgba(118, 122, 127, 1)",
                            }}
                          >
                            Công ty
                          </Text>
                          <Text
                            style={{
                              color: "rgba(20, 20, 21, 1)",
                              fontWeight: 500,
                              paddingTop: "2px",
                            }}
                          >
                            {res.data.parent_name}
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
                        <Box flex flexDirection="row" alignContent="center">
                          <Box flex>
                            {res.data.helpdesk_rating > "0" && (
                              <Box>
                                <Text
                                  style={{
                                    fontSize: "14px",
                                    color: "rgba(118, 122, 127, 1)",
                                    marginBottom: "4px",
                                  }}
                                >
                                  Đánh giá
                                </Text>
                                {Array.from({ length: 5 }).map((_, index) => (
                                  <Icon
                                    key={index + 1}
                                    icon={
                                      index < Number(res.data.helpdesk_rating)
                                        ? "zi-star-solid"
                                        : "zi-star"
                                    }
                                    size={17}
                                    style={{
                                      color:
                                        index < Number(res.data.helpdesk_rating)
                                          ? "gold"
                                          : "rgba(20, 20, 21, 1)",
                                      marginLeft: "2px",
                                    }}
                                  />
                                ))}
                              </Box>
                            )}
                          </Box>
                        </Box>

                        {res.data.rating_description ? (
                          <Box mt={3}>
                            <Text
                              style={{
                                fontSize: "14px",
                                color: "rgba(118, 122, 127, 1)",
                                marginBottom: "4px",
                              }}
                            >
                              Mô tả đánh giá
                            </Text>
                            <Text
                              style={{
                                fontSize: "14px",
                                fontWeight: 500,
                                marginBottom: "4px",
                              }}
                            >
                              {res.data.rating_description}
                            </Text>
                          </Box>
                        ) : (
                          <Text
                            style={{
                              color: "rgba(118, 122, 127, 1)",
                              fontWeight: 500,
                            }}
                          >
                            Chưa có mô tả. Vui lòng đánh giá ticket
                          </Text>
                        )}
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
                  {!isTicketClosed && ticket.status === "Wait Close" && (
                    <>
                      <Button
                        variant="tertiary"
                        style={{
                          width: "48%",
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
                        style={{ width: "48%", borderRadius: "8px" }}
                        size="medium"
                        onClick={() => {
                          setShowRatingModal(true);
                        }}
                      >
                        Đánh giá
                      </Button>
                    </>
                  )}

                  {!isCusConfirm &&
                    (ticket.status === "Open" ||
                      ticket.status === "Sent Confirm Email") &&
                    res.data.createdby !== "1847" && (
                      <>
                        <Button
                          variant="tertiary"
                          style={{
                            width: "48%",
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
                          style={{ width: "48%", borderRadius: "8px" }}
                          size="medium"
                          onClick={() => {
                            setShowConfirmModal(true);
                          }}
                        >
                          Xác nhận
                        </Button>
                      </>
                    )}

                  {/* {!isCusConfirm &&
                    (ticket.status === "Wait For Verifying" ||
                      ticket.status === "Sent Confirm Email") && (
                      <>
                        <Button
                          variant="tertiary"
                          style={{
                            width: "48%",
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
                          style={{ width: "48%", borderRadius: "8px" }}
                          size="medium"
                          onClick={() => {
                            setShowConfirmModal(true);
                          }}
                        >
                          Xác nhận
                        </Button>
                      </>
                    )} */}

                  {!isTicketReopened &&
                    (isTicketClosed ||
                      isTicketCanceled ||
                      ticket.status === "Cancel" ||
                      ticket.status === "Closed") && (
                      <>
                        <Button
                          style={{
                            width: "100%",
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
                    ((ticket.status !== "Sent Confirm Email" &&
                      ticket.status !== "Wait For Verifying") ||
                      (ticket.status === "Wait For Verifying" &&
                        res.data.createdby === "1847"))) ||
                  isTicketReopened ||
                  isCusConfirm
                    ? (ticket.status !== "Open" ||
                        res.data.createdby === "1847" ||
                        isCusConfirm ||
                        isTicketCanceled) && (
                        <Button
                          style={{
                            width: "100%",
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
                      )
                    : null}
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
                              ? userInfo.name
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

                        <>
                          {comment.file && comment.file.length > 0 && (
                            <div>
                              {comment.file.map((file, index) => (
                                <div key={index}>
                                  {file.name.endsWith(".docx") ||
                                  file.name.endsWith(".pdf") ? (
                                    <a style={{ fontSize: "12px" }}>
                                      <img
                                        src={
                                          file.name.endsWith(".docx")
                                            ? "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/.docx_icon.svg/2048px-.docx_icon.svg.png"
                                            : "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Pdf-2127829.png/600px-Pdf-2127829.png"
                                        }
                                        alt={`File Icon`}
                                        onClick={() =>
                                          openwebviewcomment(file.path)
                                        }
                                        style={{
                                          width: "60px",
                                          height: "60px",
                                          margin: "8px",
                                        }}
                                      />
                                      {file.name}
                                    </a>
                                  ) : (
                                    <img
                                      src={file.path}
                                      alt={`Attachment ${index + 1}`}
                                      onClick={() =>
                                        openImageViewer(index, comment)
                                      }
                                      style={{
                                        paddingTop: "8px",
                                        width: "60px",
                                        height: "60px",
                                        cursor: "pointer",
                                        objectFit: "contain",
                                      }}
                                      onError={() =>
                                        console.log("Not an image file")
                                      }
                                    />
                                  )}
                                </div>
                              ))}

                              {isViewerOpenComment &&
                                selectedImagesComment === comment && (
                                  <ImageViewer
                                    src={comment.file.map((file) => file.path)}
                                    currentIndex={imagesComment}
                                    disableScroll={false}
                                    closeOnClickOutside={true}
                                    onClose={closeImageViewer}
                                  />
                                )}
                            </div>
                          )}
                        </>

                        <Box flexDirection="row">
                          <Text
                            style={{
                              cursor: "pointer",
                              marginTop: "6px",
                              color: "rgba(0, 106, 245, 1)",
                            }}
                            onClick={() => {
                              commentInputRef.current?.focus();
                              setReplyToComment(comment.modcommentsid);
                            }}
                          >
                            Trả lời
                          </Text>
                          <Box>
                            <Text
                              style={{
                                cursor: "pointer",
                                marginTop: "6px",
                                color: "rgba(0, 106, 245, 1)",
                                marginLeft: "24px",
                              }}
                              onClick={() => {
                                handleIconClick(comment.modcommentsid);
                                setReplyToComment(comment.modcommentsid);
                              }}
                            >
                              Đính kèm
                            </Text>
                            <input
                              type="file"
                              accept=".jpg, .png, .docx, .pdf"
                              onChange={(e) =>
                                handleImageUpload(e.target.files)
                              }
                              multiple
                              style={{ display: "none" }}
                              ref={fileInputRef}
                            />
                          </Box>
                        </Box>
                        {images.map((image, index) => (
                          <div key={index}>
                            {selectedComment === comment.modcommentsid && ( // Chỉ hiển thị nếu commentId khớp
                              <div
                                style={{
                                  position: "relative",
                                  display: "inline-block",
                                  textAlign: "left",
                                  paddingTop: "8px",
                                }}
                              >
                                <div
                                  style={{
                                    width: "96px",
                                    height: "96px",
                                    overflow: "hidden",
                                    position: "relative",
                                    display: visibleImages.includes(
                                      comment.modcommentsid
                                    )
                                      ? "none"
                                      : "block",
                                  }}
                                >
                                  {image instanceof File && (
                                    <img
                                      onClick={() => {
                                        openPicker(index);
                                      }}
                                      src={URL.createObjectURL(image)}
                                      alt={`Hình ảnh ${index}`}
                                      style={{
                                        width: "96px",
                                        height: "96px",
                                        cursor: "pointer",
                                        objectFit: "contain",
                                      }}
                                    />
                                  )}
                                </div>
                                <Box
                                  m={1}
                                  style={{
                                    position: "absolute",
                                    bottom: 0,
                                    right: 0,
                                    cursor: "pointer",
                                    background: "white",
                                    borderRadius: "50%",
                                    padding: "2px",
                                  }}
                                  onClick={() => {
                                    handleDeleteImage(index);
                                  }}
                                >
                                  <Icon
                                    icon="zi-delete"
                                    size={16}
                                    style={{
                                      color: "rgba(0, 106, 245, 1)",
                                      display: visibleImages.includes(
                                        comment.modcommentsid
                                      )
                                        ? "none"
                                        : "block",
                                    }}
                                  />
                                </Box>
                              </div>
                            )}
                          </div>
                        ))}
                        {selectedComment === comment.modcommentsid && (
                          <ul>
                            {files.map((file, index) => (
                              <li key={index}>
                                {file.name.endsWith(".docx") ||
                                file.name.endsWith(".pdf") ? (
                                  <a style={{ fontSize: "12px" }}>
                                    <img
                                      src={
                                        file.name.endsWith(".docx")
                                          ? "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/.docx_icon.svg/2048px-.docx_icon.svg.png"
                                          : "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Pdf-2127829.png/600px-Pdf-2127829.png"
                                      }
                                      alt={`File Icon`}
                                      style={{
                                        width: "60px",
                                        height: "60px",
                                        margin: "8px",
                                      }}
                                    />
                                    {file.name}
                                  </a>
                                ) : (
                                  <span>{file.name}</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}

                        {comments.map((reply) => (
                          <div key={reply.modcommentsid}>
                            {reply.parent_comments ===
                              comment.modcommentsid && (
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
                                    {reply.assigned_owners[0].name ===
                                    "Zalo App"
                                      ? userInfo.name
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
                                {reply.file && reply.file.length > 0 && (
                                  <div>
                                    {reply.file.map((file, index) => (
                                      <div key={index}>
                                        {file.name.endsWith(".docx") ||
                                        file.name.endsWith(".pdf") ? (
                                          <a style={{ fontSize: "12px" }}>
                                            <img
                                              src={
                                                file.name.endsWith(".docx")
                                                  ? "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/.docx_icon.svg/2048px-.docx_icon.svg.png"
                                                  : "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Pdf-2127829.png/600px-Pdf-2127829.png"
                                              }
                                              alt={`File Icon`}
                                              onClick={() =>
                                                openwebviewcomment(file.path)
                                              }
                                              style={{
                                                width: "60px",
                                                height: "60px",
                                                margin: "8px",
                                              }}
                                            />
                                            {file.name}
                                          </a>
                                        ) : (
                                          <img
                                            src={file.path}
                                            alt={`Attachment ${index + 1}`}
                                            onClick={() =>
                                              openImageViewer(index, reply)
                                            }
                                            style={{
                                              paddingTop: "8px",
                                              width: "60px",
                                              height: "60px",
                                              cursor: "pointer",
                                              objectFit: "contain",
                                            }}
                                            onError={() =>
                                              console.log("Not an image file")
                                            }
                                          />
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {isViewerOpenComment &&
                                  selectedImagesComment === reply && (
                                    <ImageViewer
                                      src={reply.file.map((file) => file.path)}
                                      currentIndex={imagesComment}
                                      disableScroll={false}
                                      closeOnClickOutside={true}
                                      onClose={closeImageViewer}
                                    />
                                  )}

                                <Box flexDirection="row">
                                  <Text
                                    style={{
                                      cursor: "pointer",
                                      marginTop: "6px",
                                      color: "rgba(0, 106, 245, 1)",
                                    }}
                                    onClick={() => {
                                      commentInputRef.current?.focus();
                                      setReplyToComment(comment.modcommentsid);
                                    }}
                                  >
                                    Trả lời
                                  </Text>
                                  <Text
                                    style={{
                                      cursor: "pointer",
                                      marginTop: "6px",
                                      color: "rgba(0, 106, 245, 1)",
                                      marginLeft: "24px",
                                    }}
                                    onClick={() => {
                                      handleIconClick(reply.modcommentsid);
                                      setReplyToComment(comment.modcommentsid);
                                    }}
                                  >
                                    Đính kèm
                                  </Text>
                                  <input
                                    type="file"
                                    accept=".jpg, .png, .docx, .pdf"
                                    onChange={(e) =>
                                      handleImageUpload(e.target.files)
                                    }
                                    multiple
                                    style={{ display: "none" }}
                                    ref={fileInputRef}
                                  />
                                </Box>
                                {images.map((image, index) => (
                                  <div key={index}>
                                    {selectedComment ===
                                      reply.modcommentsid && ( // Chỉ hiển thị nếu commentId khớp
                                      <div
                                        style={{
                                          position: "relative",
                                          display: "inline-block",
                                          textAlign: "left", // Thêm dòng này
                                        }}
                                      >
                                        <div
                                          style={{
                                            width: "96px",
                                            height: "96px",
                                            overflow: "hidden",
                                            position: "relative",
                                            display: visibleImages.includes(
                                              reply.modcommentsid
                                            )
                                              ? "none"
                                              : "block",
                                          }}
                                        >
                                          <img
                                            onClick={() => {
                                              openPicker(index);
                                            }}
                                            src={URL.createObjectURL(image)}
                                            alt={`Hình ảnh ${index}`}
                                            style={{
                                              width: "96px",
                                              height: "96px",
                                              cursor: "pointer",
                                              objectFit: "contain",
                                              paddingTop: "8px",
                                            }}
                                          />
                                        </div>
                                        <Box
                                          m={1}
                                          style={{
                                            position: "absolute",
                                            bottom: 0,
                                            right: 0,
                                            cursor: "pointer",
                                            background: "white",
                                            borderRadius: "50%",
                                            padding: "2px",
                                          }}
                                          onClick={() => {
                                            handleDeleteImage(index);
                                          }}
                                        >
                                          <Icon
                                            icon="zi-delete"
                                            size={16}
                                            style={{
                                              color: "rgba(0, 106, 245, 1)",
                                              display: visibleImages.includes(
                                                reply.modcommentsid
                                              )
                                                ? "none"
                                                : "block",
                                            }}
                                          />
                                        </Box>
                                      </div>
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
                {isPickImage && (
                  <ImageViewer
                    src={imagePaths}
                    currentIndex={currentImage}
                    disableScroll={false}
                    closeOnClickOutside={true}
                    onClose={closePicker}
                  />
                )}

                {!replyToComment ? (
                  <div>
                    <Input.TextArea
                      ref={commentInputRef}
                      value={newComment.commentcontent}
                      onChange={(e) => {
                        setNewComment((prevTicket) => ({
                          ...prevTicket,
                          commentcontent: e.target.value,
                        }));
                      }}
                      maxLength={500}
                      style={{
                        height:
                          typeof newComment.commentcontent === "string" &&
                          newComment.commentcontent.split("").length >= 90
                            ? "150px"
                            : "80px",
                      }}
                    />
                    <Button
                      fullWidth
                      style={{ marginTop: "10px" }}
                      onClick={() => {
                        submitComment();
                        setNewComment((prevComment) => ({
                          ...prevComment,
                          commentcontent: "",
                        }));
                      }}
                    >
                      Gửi bình luận
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Input.TextArea
                      maxLength={500}
                      style={{
                        height:
                          typeof newComment.commentcontent === "string" &&
                          newComment.commentcontent.split("").length >= 90
                            ? "150px"
                            : "80px",
                      }}
                      ref={commentInputRef}
                      value={newComment.commentcontent}
                      onChange={(event) => {
                        setNewComment((prevTicket) => ({
                          ...prevTicket,
                          commentcontent: event.target.value,
                        }));
                      }}
                    />
                    <Button
                      fullWidth
                      style={{ marginTop: "10px" }}
                      onClick={() => {
                        submitReply(replyToComment);
                        setNewComment((prevComment) => ({
                          ...prevComment,
                          commentcontent: "",
                        }));
                        handleDeleteImage();
                      }}
                    >
                      Trả lời bình luận
                    </Button>
                  </div>
                )}
              </Tabs.Tab>
            </Tabs>
          </Box>

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
              Ticket của bạn đã được xử lý xong, bạn hãy đánh giá để giúp
              CloudGO nâng cao chất lượng dịch vụ nhé.
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
                  {value === 1 && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512 512"
                      height="40"
                      width="40"
                      onClick={() => handleClick(value)}
                    >
                      <path
                        fill={
                          selectedColor === value
                            ? colors[value]
                            : "rgba(118, 122, 127, 1)"
                        }
                        d="M256 32C132.3 32 32 132.3 32 256s100.3 224 224 224c34.6 0 67.3-7.8 96.5-21.8c1.2 11.1 4.2 21.6 8.8 31.2C329.2 503.9 293.6 512 256 512C114.6 512 0 397.4 0 256S114.6 0 256 0S512 114.6 512 256c0 30.6-5.4 59.9-15.2 87c-8.4-8.4-17.4-15.8-26.3-22.2c6.2-20.5 9.5-42.3 9.5-64.8C480 132.3 379.7 32 256 32zM116.8 234.4c21.6 28.8 64.8 28.8 86.4 0l25.6 19.2c-34.4 45.9-103.2 45.9-137.6 0l25.6-19.2zm278.4 0l25.6 19.2c-34.4 45.9-103.2 45.9-137.6 0l25.6-19.2c21.6 28.8 64.8 28.8 86.4 0zm-32 200l-26.1-10.9C313.4 413.7 285.7 408 256 408c-29.7 0-57.3 5.7-81 15.5l-26.1 10.9 4.2-28c7.4-49.3 51-86.4 103-86.4s95.7 37.1 103 86.5l4.2 28zm-46.9-51.2C303.5 364.5 281.5 352 256 352s-47.5 12.5-60.3 31.2c19-4.7 39.3-7.2 60.3-7.2c21 0 41.3 2.5 60.3 7.2zm62.8-71.9c20.8 6.2 43.3 16.1 63.6 29.3C478.5 363.7 512 399.9 512 448c0 35.3-28.7 64-64 64s-64-28.7-64-64c0-16.2-.1-39.4-7.2-61.5c-4.5-13.8-11.5-26.8-23-37.1l25.4-38.1zm28.1 65.4c8.8 27.2 8.8 54.9 8.8 70.8v.5c0 17.7 14.3 32 32 32s32-14.3 32-32c0-31.9-22.5-59.7-54.7-80.6c-9.4-6.1-19.3-11.3-29.1-15.7c4.7 8.1 8.3 16.5 11 24.9z"
                      />
                    </svg>
                  )}
                  {value === 2 && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512 512"
                      height="40"
                      width="40"
                      onClick={() => handleClick(value)}
                    >
                      <path
                        fill={
                          selectedColor === value
                            ? colors[value]
                            : "rgba(118, 122, 127, 1)"
                        }
                        d="M480 256A224 224 0 1 0 32 256a224 224 0 1 0 448 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm176.4-72a24 24 0 1 1 0 48 24 24 0 1 1 0-48zm136 24a24 24 0 1 1 48 0 24 24 0 1 1 -48 0zm36.2 183.8c-27-10-58.7-15.8-92.6-15.8c-33.9 0-65.5 5.8-92.5 15.8l-25.9 9.6 4.6-27.2C150.6 323.7 200 288 256 288s105.4 35.7 113.9 86.2l4.6 27.2-25.9-9.6zM256 320c-30.2 0-55.4 13.1-69.8 31.8c21.9-5 45.4-7.7 69.8-7.7c24.4 0 47.9 2.7 69.9 7.8C311.4 333.1 286.3 320 256 320z"
                      />
                    </svg>
                  )}
                  {value === 3 && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512 512"
                      height="40"
                      width="40"
                      onClick={() => handleClick(value)}
                    >
                      <path
                        fill={
                          selectedColor === value
                            ? colors[value]
                            : "rgba(118, 122, 127, 1)"
                        }
                        d="M480 256A224 224 0 1 1 32 256a224 224 0 1 1 448 0zM256 0a256 256 0 1 0 0 512A256 256 0 1 0 256 0zM176.4 232a24 24 0 1 0 0-48 24 24 0 1 0 0 48zm184-24a24 24 0 1 0 -48 0 24 24 0 1 0 48 0zM176 336H160v32h16H336h16V336H336 176z"
                      />
                    </svg>
                  )}
                  {value === 4 && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512 512"
                      height="40"
                      width="40"
                      onClick={() => handleClick(value)}
                    >
                      <path
                        fill={
                          selectedColor === value
                            ? colors[value]
                            : "rgba(118, 122, 127, 1)"
                        }
                        d="M480 256A224 224 0 1 0 32 256a224 224 0 1 0 448 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 98.1c-31.2 0-61.4-2.9-89.9-8.3c22.5 23.6 54.5 38.3 89.9 38.3s67.4-14.7 89.9-38.3c-28.5 5.4-58.7 8.3-89.9 8.3zm0-32c41 0 79.9-5.3 114.9-14.9c13-3.5 25.4-7.7 37.2-12.3c-3.1 13.8-8 26.9-14.5 39c-26.2 48.9-78 82.2-137.7 82.2s-111.5-33.3-137.7-82.2c-6.5-12.1-11.4-25.2-14.5-39c11.8 4.6 24.3 8.8 37.2 12.3c35.1 9.6 74 14.9 114.9 14.9zM156.5 188.5c-6.2 7.2-10.8 16.8-12.9 25.4l-31-7.8c3.2-12.7 9.8-27.1 19.9-38.6C142.4 155.9 157.2 146 176 146s33.6 9.9 43.7 21.5c10 11.5 16.7 25.9 19.9 38.6l-31 7.8c-2.1-8.6-6.7-18.2-12.9-25.4c-6.2-7.1-12.8-10.5-19.5-10.5s-13.4 3.4-19.5 10.5zm147.1 25.4l-31-7.8c3.2-12.7 9.8-27.1 19.9-38.6C302.4 155.9 317.2 146 336 146s33.6 9.9 43.7 21.5c10 11.5 16.7 25.9 19.9 38.6l-31 7.8c-2.1-8.6-6.7-18.2-12.9-25.4c-6.2-7.1-12.8-10.5-19.5-10.5s-13.4 3.4-19.5 10.5c-6.2 7.2-10.8 16.8-12.9 25.4z"
                      />
                    </svg>
                  )}
                  {value === 5 && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512 512"
                      height="40"
                      width="40"
                      onClick={() => handleClick(value)}
                    >
                      <path
                        fill={
                          selectedColor === value
                            ? colors[value]
                            : "rgba(118, 122, 127, 1)"
                        }
                        d="M256 32a224 224 0 1 1 0 448 224 224 0 1 1 0-448zm0 480A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm89.9-166.2c-22.5 23.6-54.5 38.3-89.9 38.3s-67.4-14.7-89.9-38.3c28.5 5.4 58.7 8.3 89.9 8.3s61.4-2.9 89.9-8.3zm25-38.6c-35.1 9.6-74 14.9-114.9 14.9s-79.9-5.3-114.9-14.9c-13-3.5-25.4-7.7-37.2-12.3c3.1 13.8 8 26.9 14.5 39c26.2 48.9 78 82.2 137.7 82.2s111.5-33.3 137.7-82.2c6.5-12.1 11.4-25.2 14.5-39c-11.8 4.6-24.3 8.8-37.2 12.3zM160 99.7L146.8 119l-17.9 26.2-30.4 9L76 160.7l14.2 18.5 19.4 25.2-.9 31.7-.6 23.3 22-7.8L160 241l29.9 10.6 22 7.8-.6-23.3-.9-31.7 19.4-25.2L244 160.7l-22.4-6.6-30.4-9L173.2 119 160 99.7zm0 56.6l8 11.6 3.2 4.7 5.5 1.6 13.5 4-8.6 11.2-3.5 4.5 .2 5.7 .4 14.1-13.3-4.7L160 207l-5.4 1.9-13.3 4.7 .4-14.1 .2-5.7-3.5-4.5-8.6-11.2 13.5-4 5.5-1.6 3.2-4.7 8-11.6zM352 99.7L338.8 119l-17.9 26.2-30.4 9L268 160.7l14.2 18.5 19.4 25.2-.9 31.7-.6 23.3 22-7.8L352 241l29.9 10.6 22 7.8-.6-23.3-.9-31.7 19.4-25.2L436 160.7l-22.4-6.6-30.4-9L365.2 119 352 99.7zm0 56.6l8 11.6 3.2 4.7 5.5 1.6 13.5 4-8.6 11.2-3.5 4.5 .2 5.7 .4 14.1-13.3-4.7L352 207l-5.4 1.9-13.3 4.7 .4-14.1 .2-5.7-3.5-4.5-8.6-11.2 13.5-4 5.5-1.6 3.2-4.7 8-11.6z"
                      />
                    </svg>
                  )}
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
              Chúng tôi mong muốn được lắng nghe ý kiến của bạn để giúp CloudGO
              cải thiện tốt hơn nữa. Vui lòng nhập lý do bạn muốn mở lại yêu
              cầu.
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
                updateStatus("Open");
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
                  updateStatus("Cancel");
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
                  updateStatus("Customer Confirmed");
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
    </div>
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
  "Wait Close": "Đã xong (chờ đóng)",
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
