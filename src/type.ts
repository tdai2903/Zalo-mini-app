export type TicketType = {
  title: string;
  ticket_no: string;
  createdtime: string;
  ticketcategories: string;
  status: string;
  id:string;
  comments:string;
  ticket_title: string;
  ticketpriorities: string;
  related_cpslacategory:string;
  helpdesk_subcategory:string;
  helpdesk_over_sla_reason:string;
  ticketid: string;
  starred: string;
  ticketstatus:string;
  record_id: string;
  customer:string;
  phone:string;
  email:string;
  description: string;
  contact_mobile:string;
  url: string;
}

export type NewsType={
  id: string;
  created_at: string;
  description: string;
  link_overrride:string;
  thumbnail: string;
  title:string;
  url:string;
}

export type Info= {
  id: string;
  avatar: string;
  name:string;
}

export type CommentType= {
  related_to: string;
  commentcontent: string;
  modcommentsid: string;
}
