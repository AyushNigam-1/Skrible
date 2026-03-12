import { userQueries } from "./queries/userQueries";
import { userMutations } from "./mutations/userMutations";
import { scriptQueries } from "./queries/scriptQueries";
import { scriptMutations } from "./mutations/scriptMutations";
import { paragraphQueries } from "./queries/paragraphQueries";
import { paragraphMutations } from "./mutations/paragraphMutations";

export const resolvers = {
  Query: {
    ...userQueries,
    ...scriptQueries,
    ...paragraphQueries,
  },
  Mutation: {
    ...userMutations,
    ...scriptMutations,
    ...paragraphMutations,
  },
};
