export interface ProductQuestion {
  id: string;
  text: string;
  /** Null until the seller replies. */
  answer: string | null;
  answeredAt: string | null;
  createdAt: string;
  user: { id: string; name: string };
  product: { id: string; name: string; slug: string; image: string };
}

export interface MySellerQuestionsResult {
  mySellerQuestions: ProductQuestion[];
}

export interface AnswerQuestionResult {
  answerProductQuestion: ProductQuestion;
}
