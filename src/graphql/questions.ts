import { gql } from '@apollo/client';

const QUESTION_FIELDS = gql`
  fragment QuestionFields on Question {
    id
    text
    answer
    answeredAt
    createdAt
    user {
      id
      name
    }
    product {
      id
      name
      slug
      image
    }
  }
`;

/** The seller's queue: unanswered first, oldest first within that. */
export const MY_SELLER_QUESTIONS = gql`
  ${QUESTION_FIELDS}
  query MySellerQuestions($answered: Boolean) {
    mySellerQuestions(answered: $answered) {
      ...QuestionFields
    }
  }
`;

export const ANSWER_PRODUCT_QUESTION = gql`
  ${QUESTION_FIELDS}
  mutation AnswerProductQuestion($questionId: ID!, $answer: String!) {
    answerProductQuestion(questionId: $questionId, answer: $answer) {
      ...QuestionFields
    }
  }
`;
