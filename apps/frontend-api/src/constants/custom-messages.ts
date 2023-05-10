export const messages = {
  somethingWentWrong: 'Something went wrong. Please try again later.',
  failedToRegister: 'Failed to register.',
  imageReportedSuccessfully: 'Court image reported.',
  courtNotFound: 'Court not found.',
  courtImageNotFound: 'Court image not found.',
  courtImageAlreadyReported: 'Court image has been already reported.',
  failedToRate: 'Failed to rate the court.',
  withIn100MeterRadious:
    'You must be with in 100 m radius from court location.',
  cannotCreateMatch: 'Unable to create match.',
  matchDataNotFound: 'Match not found.',
  invalidMatchFrontendUser: 'Match must consist only 2 or 4 FrontendUser.',
  teamFrontendUserEmpty: 'Team FrontendUser cannot be empty.',
  invalidTeamFrontendUser: 'Invalid team FrontendUser.',
  matchAlreadyStarted: 'Match has already been started.',
  matchOngoingOrPending: 'Previous match is in pending or ongoing state.',
  failedToStart: 'Failed to start the match.',
  failedToEnd: 'Failed to end the match.',
  invalidGameData: 'Invalid game data provided.',
  matchPointUpdated: 'Match points has been updated.',
  failedToUpdatePoints: 'Failed to update the points.',
  matchAlreadyEnded: 'Match has already been ended.',
  invalidCanceller: 'Only match creator can cancel match.',
  invalidCancelledMatch: 'Only pending matches can be cancelled.',
  invalidForfeitMatch: 'Match status must be ongoing in order to forfeit it.',
  invalidMatchTeam: 'Invalid match team provided.',
  invalidForfeiter: 'Only match creator can forfeit match.',
  failedToCancel: 'Failed to cancel match.',
  matchCancelled: 'Match has been cancelled.',
  matchForfeited: 'Match has been forfeited.',
  failedToForfeit: 'Match failed to forfeit.',
  invalidMatchEnder: 'Only match creator can end match.',
  invalidMatchUpdater: 'Only match creator can update the match.',
  FrontendUserNotBeenConfirmed: 'Match FrontendUser bas not been confirmed.',
  cannotUpdateMatchConfig: 'Match config cannot be updated now.',
  invalidConfirmer: 'Only match creator can confirm the match.',
  cannotConfirmMatch: 'Match cannot be confirmed now.',
  mustBeOngoing: 'Match status must be ongoing in order to end it.',
  FrontendUserNotFound: 'FrontendUser not found.',
  accountDeleted: 'FrontendUser account has been deleted.',
  exceeded25mins:
    'Match has been cancelled due to long pendion period. Please create new Match.',
  exceeded3hrs:
    'Match has been cancelled due to long ongoing period. Please create new Match.'
} as const;