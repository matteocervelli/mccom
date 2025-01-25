document.addEventListener("DOMContentLoaded", () => {
  const commentsSection = document.getElementById("comments-section");
  const bskyWebUrl = commentsSection?.getAttribute("data-bsky-uri");

  if (!bskyWebUrl) return;

  (async () => {
    try {
      const atUri = await extractAtUri(bskyWebUrl);
      console.log("Extracted AT URI:", atUri);

      const thread = await getPostThread(atUri);

      if (thread && thread.$type === "app.bsky.feed.defs#threadViewPost") {
        renderComments(thread, commentsSection);
      } else {
        commentsSection.textContent = "Error fetching comments.";
      }
    } catch (error) {
      console.error("Error loading comments:", error);
      commentsSection.textContent = "Error loading comments.";
    }
  })();

  const commentsButton = document.querySelector('.comments-button');
  if (commentsButton && commentsSection) {
    commentsButton.addEventListener('click', () => {
      commentsSection.scrollIntoView({ behavior: 'smooth' });
    });

    const commentCount = commentsSection.querySelectorAll('.comment').length;
    if (commentCount > 0) {
      const badge = document.createElement('span');
      badge.className = 'comments-count';
      badge.textContent = commentCount;
      commentsButton.appendChild(badge);
    }
  }
});

async function extractAtUri(webUrl) {
  try {
    const url = new URL(webUrl);
    const pathSegments = url.pathname.split("/").filter(Boolean);

    if (
      pathSegments.length < 4 ||
      pathSegments[0] !== "profile" ||
      pathSegments[2] !== "post"
    ) {
      throw new Error("Invalid URL format");
    }

    const handleOrDid = pathSegments[1];
    const postID = pathSegments[3];
    let did = handleOrDid;

    if (!did.startsWith("did:")) {
      const resolveHandleURL = `https://bsky.social/xrpc/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(
        handleOrDid,
      )}`;
      const res = await fetch(resolveHandleURL);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to resolve handle to DID: ${errorText}`);
      }
      const data = await res.json();
      if (!data.did) {
        throw new Error("DID not found in response");
      }
      did = data.did;
    }

    return `at://${did}/app.bsky.feed.post/${postID}`;
  } catch (error) {
    console.error("Error extracting AT URI:", error);
    throw error;
  }
}

async function getPostThread(atUri) {
  console.log("getPostThread called with atUri:", atUri);
  const params = new URLSearchParams({ uri: atUri });
  const apiUrl = `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?${params.toString()}`;

  console.log("API URL:", apiUrl);

  const res = await fetch(apiUrl, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("API Error:", errorText);
    throw new Error(`Failed to fetch post thread: ${errorText}`);
  }

  const data = await res.json();

  if (
    !data.thread ||
    data.thread.$type !== "app.bsky.feed.defs#threadViewPost"
  ) {
    throw new Error("Could not find thread");
  }

  return data.thread;
}

function renderComments(thread, container) {
  container.innerHTML = "";

  const postUrl = `https://bsky.app/profile/${thread.post.author.did}/post/${thread.post.uri.split("/").pop()}`;

  const divider = document.createElement("hr");
  container.appendChild(divider);

  const commentsHeader = document.createElement("h2");
  commentsHeader.textContent = "Comments via 🦋";
  commentsHeader.className = "comments-header";
  container.appendChild(commentsHeader);

  const metaDiv = document.createElement("div");
  metaDiv.className = "comments-meta";
  const link = document.createElement("a");
  link.href = postUrl;
  link.target = "_blank";
  link.textContent = `${thread.post.likeCount ?? 0} likes | ${thread.post.repostCount ?? 0} reposts | ${thread.post.replyCount ?? 0} replies`;
  metaDiv.appendChild(link);
  container.appendChild(metaDiv);

  const replyText = document.createElement("p");
  replyText.className = "join-conversation";
  const replyLink = document.createElement("a");
  replyLink.href = postUrl;
  replyLink.target = "_blank";
  replyLink.textContent = "Join the conversation";
  replyText.appendChild(replyLink);
  container.appendChild(replyText);

  if (thread.replies && thread.replies.length > 0) {
    const commentsContainer = document.createElement("div");
    commentsContainer.id = "comments-container";

    const sortedReplies = thread.replies.sort(sortByLikes);
    for (const reply of sortedReplies) {
      if (isThreadViewPost(reply)) {
        commentsContainer.appendChild(renderComment(reply));
      }
    }

    container.appendChild(commentsContainer);
  } else {
    const noComments = document.createElement("p");
    noComments.textContent = "No comments available.";
    container.appendChild(noComments);
  }
}

function renderComment(comment) {
  const { post } = comment;
  const { author } = post;

  const commentDiv = document.createElement("div");
  commentDiv.className = "comment";

  const authorDiv = document.createElement("div");
  authorDiv.className = "author";

  if (author.avatar) {
    const avatarImg = document.createElement("img");
    avatarImg.src = author.avatar;
    avatarImg.alt = "avatar";
    avatarImg.className = "avatar";
    authorDiv.appendChild(avatarImg);
  }

  const authorName = document.createElement("span");
  authorName.className = "author-name";
  authorName.textContent = author.displayName ?? author.handle.split(".")[0];
  authorDiv.appendChild(authorName);

  commentDiv.appendChild(authorDiv);

  const contentP = document.createElement("p");
  contentP.textContent = post.record.text;
  commentDiv.appendChild(contentP);

  const actionsDiv = document.createElement("div");
  actionsDiv.className = "actions";
  actionsDiv.textContent = `${post.replyCount ?? 0} replies | ${post.repostCount ?? 0} reposts | ${post.likeCount ?? 0} likes`;
  commentDiv.appendChild(actionsDiv);

  if (comment.replies && comment.replies.length > 0) {
    const nestedRepliesDiv = document.createElement("div");
    nestedRepliesDiv.className = "nested-replies";

    const sortedReplies = comment.replies.sort(sortByLikes);
    for (const reply of sortedReplies) {
      if (isThreadViewPost(reply)) {
        nestedRepliesDiv.appendChild(renderComment(reply));
      }
    }

    commentDiv.appendChild(nestedRepliesDiv);
  }

  return commentDiv;
}

function sortByLikes(a, b) {
  if (!isThreadViewPost(a) || !isThreadViewPost(b)) {
    return 0;
  }
  return (b.post.likeCount ?? 0) - (a.post.likeCount ?? 0);
}

function isThreadViewPost(obj) {
  return obj && obj.$type === "app.bsky.feed.defs#threadViewPost";
}