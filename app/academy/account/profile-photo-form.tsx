"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { useRef, useState } from "react";

export function ProfilePhotoForm() {
  const { isLoaded, isSignedIn, user } = useUser();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  if (!isLoaded || !isSignedIn || !user) return null;
  const currentUser = user;

  async function uploadPhoto() {
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setMessage("Choose a profile photo first.");
      return;
    }
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      setMessage("Choose an image smaller than 5 MB.");
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      await currentUser.setProfileImage({ file });
      await currentUser.reload();
      setMessage("Your profile picture was updated.");
      if (inputRef.current) inputRef.current.value = "";
    } catch {
      setMessage("We could not update that picture. Try a PNG or JPG image.");
    } finally {
      setBusy(false);
    }
  }

  async function removePhoto() {
    setBusy(true);
    setMessage("");
    try {
      await currentUser.setProfileImage({ file: null });
      await currentUser.reload();
      setMessage("Your custom profile picture was removed.");
    } catch {
      setMessage("We could not remove the picture. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="profile-photo-card">
      <p className="eyebrow">PROFILE PICTURE</p>
      <div className="profile-photo-heading">
        <UserButton
          userProfileMode="navigation"
          userProfileUrl="/academy/account"
          appearance={{ elements: { avatarBox: "account-avatar" } }}
        />
        <div>
          <h2>Your profile picture</h2>
          <p>This is the photo displayed beside your name in the Academy.</p>
        </div>
      </div>
      <label>
        Choose a new picture
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" />
        <small>PNG, JPG, or WebP · maximum 5 MB</small>
      </label>
      <div className="photo-actions">
        <button className="gold" type="button" disabled={busy} onClick={uploadPhoto}>
          {busy ? "Saving…" : "Update Profile Picture"}
        </button>
        {currentUser.hasImage && (
          <button className="outline-button" type="button" disabled={busy} onClick={removePhoto}>
            Remove Picture
          </button>
        )}
      </div>
      {message && <div className="inline-account-message">{message}</div>}
    </section>
  );
}
