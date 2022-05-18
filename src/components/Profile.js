import React, { useState, useEffect } from 'react';
import { View, TouchableWithoutFeedback, KeyboardAvoidingView } from 'react-native';
import { Button, Datepicker, Divider, Icon, Input, Layout, StyleService, useStyleSheet, Select, SelectItem, IndexPath } from '@ui-kitten/components';
import TopHeader from './TopHeader';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { addProfileInfo, deleteProfileInfo, editProfileInfo, getProfileInfo } from '../controllers/profileController';

const Profile = ({navigation}) => {

  const { currentUser } = useAuth();
  const styles = useStyleSheet(themedStyles);

  const [ email, setEmail ]= useState('');
  const [ firstName, setFirstName ] = useState('');
  const [ lastName, setLastName ] = useState('');
  const [ phoneNumber, setPhoneNumber ] = useState('');
  const [ docId, setDocId ] = useState('');
  const [ newProfile, setNewProfile ] = useState(true);

  //Arreglar
  const handleSaveButtonPress = async() => {
    if(!newProfile) {
      const oldProfile = getProfileInfo(currentUser.uid);
      const res = deleteProfileInfo(currentUser.uid, oldProfile.id);
    }
    let profile = {
      firstName: firstName,
      lastName: lastName,
      phoneNumber: phoneNumber,
    }
    try {
      //if(newProfile) {
        const res = await addProfileInfo(currentUser.uid, profile);
        setDocId(res.id);
        navigation.goBack()
      /*}
      else {
        const res = await editProfileInfo(currentUser.uid, profile, docId)
        navigation.goBack()
      }*/
    } 
    catch (error) {
      console.log(error)  
    }
  }

  useEffect(async () => {
    try {
      setEmail(currentUser.email);
      const profile = await getProfileInfo(currentUser.uid);
      if (profile && profile.length > 0) {
        setNewProfile(false);
        setFirstName(profile[0].firstName);
        setLastName(profile[0].lastName);
        setPhoneNumber(profile[0].phoneNumber);
        setDocId(profile[0].id);
      }
    } catch (error) {
      console.log(error)
    }
  }, [navigation])

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <TopHeader screenName='Mi Perfil' />
      <Layout
        style={styles.form}
        level='1'
      >
        <Input
          style={styles.input}
          label='EMAIL'
          placeholder='direccion@email.com'
          value={email}
          onChangeText={setEmail}
          disabled={true}
        />
        <Input
          style={styles.input}
          label='NOMBRE'
          placeholder='Alberto'
          value={firstName}
          onChangeText={setFirstName}
        />
        <Input
          style={styles.input}
          label='APELLIDO'
          placeholder='Mendez'
          value={lastName}
          onChangeText={setLastName}
        />
        <Input
          style={styles.input}
          label='TELÉFONO'
          placeholder='112233445566'
          keyboardType='numeric'
          maxLength={20}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />
      </Layout>
      <Divider />
      <Button
        style={styles.addButton}
        size='giant'
        onPress={handleSaveButtonPress}
      >
        GUARDAR
      </Button>
    </KeyboardAvoidingView>
  )
}

const themedStyles = StyleService.create({
  container: {
    flex: 1,
    backgroundColor: 'background-basic-color-2',
  },
  form: {
    flex: 1,
    paddingHorizontal: 4,
    paddingVertical: 24,
  },
  input: {
    marginHorizontal: 12,
    marginVertical: 8,
  },
  addButton: {
    marginHorizontal: 16,
    marginVertical: 24,
  },
});

export default Profile