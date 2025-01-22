import { userQueries } from './user/userQueries';
import { userMutations } from './user/userMutations';
import { scriptQueries } from './script/scriptQueries';
import { scriptMutations } from './script/scriptMutations';


export const resolvers = {
    Query: {
        ...userQueries,
        ...scriptQueries,
    },
    Mutation: {
        ...userMutations,
        ...scriptMutations,
    },
};
