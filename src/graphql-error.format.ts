import { GraphQLError, GraphQLFormattedError } from "graphql";

//Change the format of the output error because
//HttpExceptions are not formated properly by GraphQL
export function formatGQLError(error: GraphQLError): GraphQLFormattedError {
    return {
        message: error?.message,
        path: error?.path,
        extensions: {
            code: error?.extensions['code'],
            status: error?.extensions['exception']['status'],
          },
      }
  }