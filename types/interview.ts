export enum InterviewStyle {
  IN_PERSON = "in_person",
  VIDEO_CALL = "video_call",
  PHONE_CALL = "phone_call",
  TECHNICAL = "technical",
  PANEL = "panel",
  CASE_STUDY = "case_study",
}

export const INTERVIEW_STYLE_LABELS: Record<InterviewStyle, string> = {
  [InterviewStyle.IN_PERSON]: "In-Person",
  [InterviewStyle.VIDEO_CALL]: "Video Call",
  [InterviewStyle.PHONE_CALL]: "Phone Call",
  [InterviewStyle.TECHNICAL]: "Technical Interview",
  [InterviewStyle.PANEL]: "Panel Interview",
  [InterviewStyle.CASE_STUDY]: "Case Study",
};
