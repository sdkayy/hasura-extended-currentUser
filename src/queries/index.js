import { apolloFetch } from "..";

const getUserByIdQuery = `
query users_by_pk($id: uuid!) {
    currentUser: users_by_pk(id: $id) {
        id
        email
        planId
    }
}
`;

export const getUserById = userId => {
  return apolloFetch({
    query: getUserByIdQuery,
    variables: {
      id: userId
    }
  });
};
