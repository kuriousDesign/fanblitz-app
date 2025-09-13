'use server'

import { SpreadPickClientType, SpreadPickModel } from "@/models/SpreadPick";
import { createClientSafePostHandler } from "@/utils/actionHelpers";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const postSpreadPick = createClientSafePostHandler<SpreadPickClientType>(SpreadPickModel as any);