/*
Payload: {
  fileId: "...",
  sharedWithUserId: "...",
  fileName: "...",
  permission: "read" | "edit",
  sharedWith: [{ userId, permission }],
  url: "file url"
}
*/

export const handleShareFileEvent = async (payload, clients) => {
  const { sharedWithUserId, fileId, fileName, permission, sharedWith, url } = payload;

  const message = JSON.stringify({
    event: "fileShared",
    data: {
      _id: fileId,
      fileName,
      permission,
      sharedWith,
      url,
      createdAt: new Date().toISOString() // optional: can use actual DB timestamp if available
    },
  });

  // Notify the target user if online
  if (clients.has(sharedWithUserId)) {
    clients.get(sharedWithUserId).forEach(ws => {
      if (ws.readyState === ws.OPEN) ws.send(message);
    });
  }
};
