import React from 'react';
import { useNavigate, useParams, Navigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import SimpleMDE from 'react-simplemde-editor';

import 'easymde/dist/easymde.min.css';
import { selectIsAuth } from '../../redux/slices/auth';
import styles from './AddPost.module.scss';
import axios from '../../axios.js';

export const AddPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isAuth = useSelector(selectIsAuth);
  const [isLoading, setLoading] = React.useState(false);
  const [text, setText] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [tags, setTags] = React.useState('');
  const [imageUrl, setImageUrl] = React.useState('');
  const inputFileRef = React.useRef(null);

  const isEditing = Boolean(id);

  const handleChangeFile = async (event) => {
    try {
      const formData = new FormData(); // formData = new FormData() это специальный формат который позволяет загружать картинку вшивать её и отправлять в backend
      const file = event.target.files[0]; // Теперь мы пишем что formData должен применить к себе formData.append('image') специальное свойство "image" и эту картинку мы вытаскиваем из event.target.files[0] первым массивом.
      formData.append('image', file); // Теперь этот файл мы передаём на сервак то есть мы говорим вшей его в formData а теперь уже ты его с помощью axios возьми этот файл сделай post запрос на const {data} = await axios.post('/upload', formData) возьми formData в котором есть этот файл отправь его на сервак
      const { data } = await axios.post('/upload', formData);
      console.log(data); //И когда ты вернёшь мне ответ любой ответ когда ты мне вернёшь скажи мне какая ссылка у этого файла: consoloe.log(data)
      setImageUrl(data.url); //И мы теперь этот imageUrl и к нему прибавляем вот эту вот ссылку которая находится в: data и объясняем когда запрос произошёл корректно дай мне из этого запроса: setImageUrl(data.url) и сохрани её в локальный стейт
    } catch (error) {
      console.warn(error);
      alert('Ошибка при загрузке файла!');
    } //Если произошла какая либо ошибка её выведит в консоли: console.warn(error), и скажи мне об этом: alert('Ошибка при загрузке файла!')
  };

  const onClickRemoveImage = () => {
    alert('Вы действительно хотите удалить файл?', setImageUrl(''));
  };

  const onChange = React.useCallback((value) => {
    setText(value);
  }, []);

  const onSubmit = async () => {
    try {
      setLoading(true);

      const fields = {
        title,
        imageUrl,
        tags,
        text,
      };

      const { data } = isEditing
        ? await axios.patch(`/posts/${id}`, fields)
        : await axios.post('/posts', fields);

      const _id = isEditing ? id : data._id;

      navigate(`/posts/${_id}`);
    } catch (error) {
      console.warn(error);
      alert(`Ошибка ${error} при создании статьи!`);
    }
  };

  React.useEffect(() => {
    if (id) {
      axios
        .get(`/posts/${id}`)
        .then(({ data }) => {
          console.log('data:', data);
          setTitle(data.title);
          setText(data.text);
          setImageUrl(data.imageUrl);
          setTags(data.tags.join(','));
        })
        .catch((err) => {
          console.log(err);
          alert('Ошибка при получении статьи!');
        });
    }
  }, {});

  const options = React.useMemo(
    () => ({
      spellChecker: false,
      maxHeight: '400px',
      autofocus: true,
      placeholder: 'Введите текст...',
      status: false,
      autosave: {
        enabled: true,
        delay: 1000,
      },
    }),
    [],
  );

  if (!window.localStorage.getItem('token') && !isAuth) {
    return <Navigate to="/" />;
  }

  return (
    <Paper style={{ padding: 30 }}>
      <Button onClick={() => inputFileRef.current.click()} variant="outlined" size="large">
        Загрузить превью
      </Button>
      <input ref={inputFileRef} type="file" onChange={handleChangeFile} hidden />

      {imageUrl && (
        <>
          <Button variant="contained" color="error" onClick={onClickRemoveImage}>
            Удалить
          </Button>
          <img className={styles.image} src={`http://localhost:4444${imageUrl}`} alt="Uploaded" />
        </>
      )}

      <br />
      <br />
      <TextField
        classes={{ root: styles.title }}
        variant="standard"
        placeholder="Заголовок статьи..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        fullWidth
      />
      <TextField
        value={tags}
        classes={{ root: styles.tags }}
        variant="standard"
        placeholder="Тэги"
        onChange={(e) => setTags(e.target.value)}
        fullWidth
      />
      <SimpleMDE className={styles.editor} value={text} onChange={onChange} options={options} />
      <div className={styles.buttons}>
        <Button onClick={onSubmit} size="large" variant="contained">
          {isEditing ? 'Сохранить' : 'Опубликовать'}
        </Button>
        <Link to="/">
          <Button size="large">Отмена</Button>
        </Link>
      </div>
    </Paper>
  );
};
