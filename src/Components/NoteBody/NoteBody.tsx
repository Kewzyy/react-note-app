import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarMinus, faEdit } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import jwt_decode from "jwt-decode";
//@ts-ignore
import Style from "./NoteBody.module.scss";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { faPlusSquare } from "@fortawesome/free-regular-svg-icons";

function NoteBody() {
  const baseURL: string = "https://route-egypt-api.herokuapp.com/";
  const token: string = localStorage.getItem("noteToken");
  const decoded = jwt_decode<MyToken>(token);
  const user: string = localStorage.getItem("user");


  let [notes, setNotes] = useState<Notes[]>([]);
  let [show, setShow] = useState<boolean>(false);
  let [noteId, setNoteId] = useState<string>("");
  let [waiting, setWaiting] = useState<boolean>(false);
  let [deleteState, setDeleteState] = useState<boolean>(false);
  let [editState, setEditState] = useState<boolean>(false);
  let [addState, setAddState] = useState<boolean>(false);
  let [editedNote, setEditedNote] = useState<Notes>({ title: "", desc: "" });
  let [addNote, setAddNote] = useState<Notes>({ title: "", desc: "" });

  const getNotes = async () => {
    var { data } = await axios.get(`${baseURL}getUserNotes`, {
      headers: {
        token,
        userID: decoded._id,
      },
    });
    setNotes(data.Notes);
  };

  useEffect(() => {
    getNotes();
  });

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const deleteNote = async (id) => {
    setWaiting(true);
    await axios.delete(`${baseURL}deleteNote`, {
      data: {
        NoteID: id,
        token,
      },
    });
    getNotes();
    handleClose();
    setWaiting(false);
  };

  const activeDelete = () => {
    setDeleteState(true);
    setEditState(false);
    setAddState(false);
  };
  const activeEdit = () => {
    setEditState(true);
    setDeleteState(false);
    setAddState(false);
  };
  const activeAdd = () => {
    setAddState(true);
    setDeleteState(false);
    setEditState(false);
  };

  const saveValueOfEditNoteInputs = ({ target }) => {
    setEditedNote({ ...editedNote, [target.name]: target.value });
  };

  const handlingEditInputs = (id) => {
    setEditedNote({
      title: notes.filter((note) => {
        return note._id === id;
      })[0].title,
      desc: notes.filter((note) => {
        return note._id === id;
      })[0].desc,
    });
  };

  const editNote = async (id) => {
    setWaiting(true);
    await axios.put(`${baseURL}updateNote`, {
      title: editedNote.title,
      desc: editedNote.desc,
      NoteID: noteId,
      token,
    });
    getNotes();
    handleClose();
    setWaiting(false);
  };

  const addNewNote = async () => {
    setWaiting(true);
    await axios.post(`${baseURL}addNote`, {
      title: addNote.title,
      desc: addNote.desc,
      userID: decoded._id,
      token,
    });
    getNotes();
    handleClose();
    setWaiting(false);
    setAddNote({ title: "", desc: "" });
  };

  const saveValueOfAddNoteInputs = ({ target }) => {
    setAddNote({ ...addNote, [target.name]: target.value });
  };

  return (
    <>
      <Button
        variant="primary"
        className="my-5"
        onClick={() => {
          activeAdd();
          handleShow();
        }}
      >
        <FontAwesomeIcon icon={faPlusSquare} /> Add New Note
      </Button>
      <div className="row">
        {notes &&
          notes.map((value, index) => {
            return (
              <div key={value._id} className="col-lg-4 mb-4">
                <div className="note p-4 bg-warning text-dark">
                  <div className="noteHeader d-flex justify-content-around">
                    <div className="title w-50">
                      <strong>{`${user} :`}</strong>
                      <h3>{value.title}</h3>
                    </div>
                    <div className="noteIcons d-flex justify-content-around w-25">
                      <FontAwesomeIcon
                        className={Style.noteIcon}
                        icon={faCalendarMinus}
                        onClick={() => {
                          activeDelete();
                          setNoteId(value._id);
                          handleShow();
                        }}
                      />
                      <FontAwesomeIcon
                        className={Style.noteIcon}
                        icon={faEdit}
                        onClick={async () => {
                          activeEdit();
                          await setNoteId(`${value._id}`);
                          handlingEditInputs(value._id);
                          handleShow();
                        }}
                      />
                    </div>
                  </div>
                  <div className="noteBody">
                    <p>{value.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* ===== ------ ===== < Add & Edit & Delete Modal > ===== ------ ===== */}

      <Modal show={show} onHide={handleClose}>
        <Modal.Header>
          <Modal.Title className={Style.modalColor}>
            {deleteState && "Delete Note"}
            {editState && (
              <Form.Control
                onChange={saveValueOfEditNoteInputs}
                type="text"
                placeholder="Enter Note Title"
                name="title"
                value={editedNote.title}
              />
            )}
            {addState && (
              <Form.Control
                onChange={saveValueOfAddNoteInputs}
                type="text"
                placeholder="Enter Note Title"
                name="title"
              />
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className={Style.modalColor}>
          {deleteState && "Are you sure ?"}
          {editState && (
            <Form.Control
              onChange={saveValueOfEditNoteInputs}
              type="text"
              placeholder="Enter Note Description"
              name="desc"
              value={editedNote.desc}
            />
          )}
          {addState && (
            <Form.Control
              onChange={saveValueOfAddNoteInputs}
              type="text"
              placeholder="Enter Note Description"
              name="desc"
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="info" onClick={handleClose}>
            Close
          </Button>
          {deleteState && (
            <Button
              variant="danger"
              onClick={() => {
                deleteNote(noteId);
              }}
            >
              {!waiting && "Delete"}
              {waiting && "Wait ... "}
            </Button>
          )}
          {editState && (
            <Button
              variant="warning"
              onClick={() => {
                editNote(noteId);
              }}
            >
              {!waiting && "Edit"}
              {waiting && "Wait ... "}
            </Button>
          )}
          {addState && (
            <Button
              variant="primary"
              onClick={() => {
                addNewNote();
              }}
            >
              {!waiting && "Add"}
              {waiting && "Wait ... "}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default NoteBody;

interface MyToken {
  _id: string;
  token: string; 
  options?: TextDecodeOptions;
}

interface Notes {
  _id?: string;
  title: string; 
  desc: string;
}