import { View, Text, TextInput, StyleSheet, Button, Alert, FlatList, ScrollView, Dimensions, TouchableHighlight } from 'react-native'
import React, { useEffect, useState } from 'react'
import SQLite, { SQLiteDatabase, ResultSet, openDatabase } from 'react-native-sqlite-storage' 


//burada bir veri tabanı oluşturuyor 
const db = openDatabase({
  location: "Documents",
  name: "toDo"

}, () => {
  console.log("veri tabanı oluşturma başarılı",);
}, (err) => {
  console.log("hata", err);

})

interface DataItem {
  id: number;
  title: string;
  description: string;
  startDate: Date;
}

const App = () => {

  const [title, setTaskname] = useState("")
  const [description, setExplain] = useState("")
  const [todolist, setTodolist] = useState<Array<DataItem>>([])
  console.log(todolist);


  let today = new Date();
  let date = today.getDate() + "." + (today.getMonth() + 1) + "." + today.getFullYear()+"." + today.getHours()+"." + today.getMinutes() +"." + today.getSeconds() ;
  console.log(date);
  

  //burada bir tablo oluşturuyor
  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql('CREATE TABLE IF NOT EXISTS toDo (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT,startDate date)', [], (tx, res) => {
        //console.log(res.rowsAffected)
        //console.log("tx",tx)
        //console.log("res",res)
      })
    })
  }, [])

  const createRecord = () => {

    if (!title === null && !description === null) {
      Alert.alert("Boş olamaz")
    }
    else{
      db.transaction((tx) => {
        tx.executeSql('INSERT INTO toDo (title,description,startDate) VALUES (?,?,?)', [title, description, date], (tx, res) => {
          //console.log(res.rowsAffected)
          //console.log("tx",tx)
          //console.log("res",res)
          if (res.rowsAffected > 0) {
            readData()
            clearInput()
          }
          else {
            Alert.alert("kayıt ekleme başarısız")
          }
        },(error) => {
          Alert.alert("bir hata oluştu", error.toString())
        })
      }
      )
    }
  }


  const deleteAlldata = () => {
    db.transaction((tx) => {
      tx.executeSql('DELETE FROM toDo', [], (tx, res) => {
        //console.log(res.rowsAffected)
        //console.log("tx",tx)
        //console.log("res",res)
        Alert.alert("silindi")
        setTodolist([])
        readData()
        clearInput()
      
      })
    })
  }


  const readData = () => {
    db.transaction((tx) => {
      tx.executeSql('SELECT * FROM toDo ORDER BY startDate asc', [], (tx, res) => {
        //console.log("tx", tx)
        //console.log("res", res)
        let temp = []
        for (let i = 0; i < res.rows.length; i++) {
          //setTodolist(res.rows.item(i).title) 
          //setTodolist(res.rows.item(i).description);
          //console.log(res.rows.length);
          temp.push({
                      id: res.rows.item(i).id,
                      title: res.rows.item(i).title,
                      description: res.rows.item(i).description,
                      startDate: res.rows.item(i).startDate
                    })
          setTodolist(temp)
        }
        clearInput()
      })
    })
  }
  const clearInput = ()=> {
    setTaskname("")
    setExplain("")
    

  }

  //veritabanından silmek için kod
  const deleteRecord = (item:DataItem)=> {
    Alert.alert(
      "Silmek istediğinizden emin misiniz?",
      "",
      [
        {
          text: "Evet",
          onPress: () => {
            db.transaction((tx) => {
              tx.executeSql('DELETE FROM toDo WHERE id=?', [item.id], (tx, res) => {
                //console.log(res.rowsAffected)
                //console.log("tx",tx)
                //console.log("res",res)
                //Alert.alert("silindi")
                setTodolist([])
                readData()
                clearInput()
              })
            })
          }
        },
        {
          text: "Hayır",
          onPress: () => {
            console.log("Hayır")
          }
        }
      ]
    )
  }

  //burada her bir elemanın id değerine ulaşmayı deniyorum
  const handlePresCard  = (item:DataItem)=> {
    console.log("bastın silindi ",item.id);
    
  }

  useEffect(() => {
    readData()
  }, []);

  return (
    <View>
      <ScrollView>
        <Text style={styles.title}>Görev Ekle</Text>
        <TextInput
          style={styles.input}
          onChangeText={(e) => setTaskname(e)}
          placeholder='görev ekleyin'
          value={title}
        />
        <TextInput
          style={styles.input}
          onChangeText={(e) => setExplain(e)}
          placeholder='açıklama ekleyin'
          value={description}
        />

        <View>
          <View style={styles.eklebutton}>
          <Button
            onPress={createRecord}
            title="ekle"
            color="green"
          />
          </View>

          <View style={styles.butongrup}>
            <Button
              onPress={readData}
              title="yenile"
              color="burlywood"
            />
            <Button
              onPress={deleteAlldata}
              title="tümünü sil"
              color="darkred"
            />
          </View>
        </View>

        <View>
        </View>
        <FlatList
          style={styles.listshow}
          data={todolist}
          renderItem={({ item }) => (
            <TouchableHighlight onPress={()=> deleteRecord(item)}>
              <View style={styles.item}>
                <Text style={[styles.fontcolor,styles.titleCard]}>{item.title}</Text>
                <Text style={styles.fontcolor}>{item.description}</Text>
                <Text style={styles.fontcolor}>eklenme tarihi {item.startDate.toString()}</Text>
              </View>
            </TouchableHighlight>
          )}
        ListEmptyComponent={<Text style={styles.emptyText}>Listede henüz bişey yok </Text>}
        />
      </ScrollView>
    </View>
  )
}


const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    marginTop: 10,
    textAlign: "center",
  },
  input: {
    borderColor: "black",
    borderWidth: 1,
    margin: 20,
    borderRadius: 20
  },
  eklebutton:{
    marginHorizontal:20,
    borderRadius: 20,
  },
  butongrup: {
    borderRadius: 20,
    marginHorizontal:20,
    marginTop:10,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  listshow: {
    margin: 10,
  },
  item: {
    backgroundColor: "gray",
    borderColor:"black",
    borderWidth: 1,
    margin:10,
    padding:20,
    borderRadius:15

  },
  fontcolor: {
    color: "black",
    fontSize: 20
  },
  titleCard:{
    fontSize:20,
    textAlign:"center",
    height:40,
  },
  emptyText:{
    margin:20,
    padding:10,
    backgroundColor:"#124100",
    color:"white",
    fontSize:20,
    textAlign:"center",
    height:150
  }

})

export default App