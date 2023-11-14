

export type TicketType = {
  title: string;
  category:string;
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
  helpdesk_rating:string;
  ticketstatus:string;
  record_id: string;
  contact_id: string;
  customer:string;
  contact_name:string;
  contact_email:string;
  description: string;
  contact_mobile:string;
  imagename: string;
  imagename_path: TicketType[];
  filename:TicketType[];
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
  parent_comments: string;
  createdtime: string;
  assigned_owners: Array<CommentType>;
  name:string;
  userid:string;
  id: string;
}

export type RatingType = {
  helpdesk_rating: number;
  rating_description: string;
}

export type ContactType = {
  firstname:string;
  lastname:string;
  mobile:string;
  email: string;
  zalo_id_miniapp: string;
}