import { userQueries } from './user/userQueries';
import { userMutations } from './user/userMutations';
import { scriptQueries } from './script/scriptQueries';
import { scriptMutations } from './script/scriptMutations';
import { paragraphQueries } from './paragrah/paragraphQueries';
import { requestMutations } from './request/requestMutations';


export const resolvers = {
    Query: {
        ...userQueries,
        ...scriptQueries,
        ...paragraphQueries,
    },
    Mutation: {
        ...requestMutations,
        ...userMutations,
        ...scriptMutations,
    },
};
