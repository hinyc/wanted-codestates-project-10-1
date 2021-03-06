import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { counterData } from '../modules/mainPage';
// 왜그래 정말
const useIntersect = (targetRef, getSearchRepo, setGetSearchRepo) => {
  const page = useSelector((state) => state.mainPage.pageCounter);
  const searchText = useSelector((state) => state.mainPage.searchString);
  const [showList, setShowList] = useState([]);
  const dispatch = useDispatch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getApiHandler = (target, page) => {
    const url = 'https://api.github.com';
    (async () => {
      try {
        const res = await axios.get(
          `${url}/search/repositories?q=${target}&per_page=20&page=${page}`,
          {
            headers: {
              Authorization: process.env.REACT_APP_API_TOKEN,
            },
          },
        );

        const result = res.data.items.map((el) => {
          const fullName = el.full_name.split('/');
          return { userID: fullName[0], repoName: fullName[1] };
        });

        setGetSearchRepo([...getSearchRepo, ...result]);
        dispatch(counterData());
      } catch (err) {
        console.log('더 이상 데이터 없음');
      }
    })();
  };

  const callback = useCallback(
    ([entry]) => {
      if (entry.isIntersecting) {
        console.log('데이터 추가 스크롤 시작');
        getApiHandler(searchText, page);
      }
    },
    [getApiHandler, page, searchText],
  );

  useEffect(() => {
    if (Array.isArray(getSearchRepo)) {
      setShowList(getSearchRepo);
    }
    if (!targetRef.current) return;
    const observer = new IntersectionObserver(callback, {
      root: null,
      rootMargin: '0px',
      threshold: 1.0,
    });
    observer.observe(targetRef.current);
    return () => observer.disconnect();
  }, [targetRef, callback, getSearchRepo]);
  return showList;
};

export default useIntersect;
