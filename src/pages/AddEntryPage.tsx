import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonDatetime,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { url } from 'inspector';
import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import { useAuth } from '../auth';
import {firestore, storage} from '../firebase';

const AddEntryPage: React.FC = () => {
  
async function savePicture(blobUrl, userId) {
  const pictureRef = storage.ref(`/users/${userId}/pictures/${Date.now()}`);
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  const snapshot = await pictureRef.put(blob);
  const url = await snapshot.ref.getDownloadURL();
  return url;
};
  
  const {userId} = useAuth();
  const history = useHistory();

  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pictureUrl, setPictureUrl] = useState('/assets/placeholder.png');
  const fileInputRef = useRef<HTMLInputElement>();

  useEffect(() => () => {
    if (pictureUrl.startsWith('blob: ')) {
      URL.revokeObjectURL(pictureUrl);
    }
  }, [pictureUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  if (event.target.files.length > 0) {
    const file = event.target.files.item(0);
    const pictureUrl = URL.createObjectURL(file);
    setPictureUrl(pictureUrl);
  }
};
  const handleSave = async () => {
    const entriesRef = firestore.collection('users').doc(userId).collection('entries');
    const entryData = { date, title, pictureUrl, description };
    if (pictureUrl.startsWith("blob: ")) {
      entryData.pictureUrl = await savePicture(pictureUrl, userId);
    }
    const entryRef = await entriesRef.add(entryData);
    console.log('saved: ', entryRef.id);
    history.goBack();
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton/>
          </IonButtons>
          <IonTitle> Add entry </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="stacked">Date</IonLabel>
            <IonDatetime value={date}
            onIonChange={(event) => setDate(event.detail.value)}/>
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Title</IonLabel>
            <IonInput value={title}
            onIonChange={(event) => setTitle(event.detail.value)}/>
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Picture</IonLabel> <br />
            <input type="file" accept="image/*" hidden
            onChange = {handleFileChange} ref = {fileInputRef} />
            <img src= {pictureUrl} alt="" style = {{cursor: "pointer"}}
              onClick={ () => fileInputRef.current.click()}/>
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Desciption</IonLabel>
            <IonTextarea value={description}
            onIonChange={(event) => setDescription(event.detail.value)}/>
          </IonItem>
          <IonButton expand="block" onClick={handleSave}>Save</IonButton>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default AddEntryPage;
