import { from, useMutation } from '@apollo/client';
import React, { useEffect, useState } from 'react';
import { GET_ALL_QUIZ } from '../../gqlOperatons/Quiz/mutations';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading } from '../../app/user/userSlice';
import toast from 'react-hot-toast';
import { Loader } from '../Loader';
import moment from 'moment';
import { Link, useNavigate } from 'react-router-dom';
import { BiBookAdd } from "react-icons/bi";



function MyQuizes() {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoading, ready, loggedIn, id } = useSelector((state) => state.user);

    const QuizLogo1 = '/Quiz-logo-1.png';
    const userId = parseInt(id);


    const [ERROR, setError] = useState(null);
    const [quizes, setQuizes] = useState(null);
    const [buttonIndex, setButtonIndex] = useState(0);

    const [getAllQuiz] = useMutation(GET_ALL_QUIZ, {
        onError: (error) => {
            console.log("on erro at all quiz ", error);
            return setError(error);
        }

    });

    useEffect(() => {
        if (!ready) return;
    }, [ready, loggedIn]);

    useEffect(() => {
        (
            async () => {
                dispatch(setLoading(true));
                try {
                    const { data, errors } = await getAllQuiz();
                    if (errors) {
                        dispatch(setLoading(false));
                        return setError(errors);
                    }
                    else if (data) {
                        dispatch(setLoading(false));
                        console.log("all quizes ", data);
                        setQuizes(data.getAllQuiz);
                        // return setQuizes(data.getAllQuiz
                    }

                } catch (error) {
                    // console.log("error", error);
                    dispatch(setLoading(false));
                    return setError(error);
                }
            }
        )();

    }, [dispatch]);

    useEffect(() => {
        if (quizes) {
            let sortedQuizes;
            if (buttonIndex === 0) {
                sortedQuizes = [...quizes].sort((a, b) => moment(b.startTime).diff(moment(a.startTime)));
                setQuizes(sortedQuizes);
            }
            else {
                sortedQuizes = [...quizes].sort((a, b) => {
                    const currentTime = moment();
                    const diffA = Math.abs(currentTime.diff(moment(a.startTime)));
                    const diffB = Math.abs(currentTime.diff(moment(b.startTime)));
                    return diffA - diffB;
                });
                setQuizes(sortedQuizes);
            }

        }
    }, [buttonIndex]);

    const handleNewQuiz = () => {
        return navigate('/contribute/quiz');
    }

    const HandleFilterCondition = (quiz) => {
        if (!ready) return false;
        if (buttonIndex === 0 && parseInt(quiz.createdBy) === (userId)) {
            return (true);
        }
        else if (buttonIndex === 1 && parseInt(quiz.createdBy) === (userId)) {
            return (moment(quiz.startTime).isBefore(moment()));
        }
        else if (buttonIndex === 2 && parseInt(quiz.createdBy) === (userId)) {
            return (moment(quiz.startTime).isAfter(moment()));
        }
        else if (buttonIndex === 3 && parseInt(quiz.createdBy) === (userId)) {
            return (moment().isBefore(moment(quiz.endTime)) && moment().isAfter(moment(quiz.startTime)));
        }
        else return false;
    }

    const baseButtonClass = "text-sm p-2 w-1/4 text-center cursor-pointer border-gray-400 dark:border-gray-200";
    const selectedButtonClass =
        "bg-gray-200 dark:bg-gray-800 border-t border-l border-r rounded-t";
    const nonSelectedButtonClass = "border-b";


    if (isLoading || !ready) {
        return <Loader />;
    }
    if (ready && !loggedIn) {
        return navigate('/register');
    }
    if (ERROR) {
        toast.error(ERROR.message ? ERROR.message : ERROR || "something went wrong");
    }
    return (
        <div className='flex flex-col items-center mb-5 mx-1 gap-5 min-w-screen max-w-screen min-h-screen' >
            <img className='w-full h-80 object-cover' src={QuizLogo1} alt="Quiz logo" />
            <div className='w-full flex'>
                <button className={`${baseButtonClass} ${buttonIndex === 0 ? selectedButtonClass : nonSelectedButtonClass
                    }`}
                    onClick={() => setButtonIndex(0)}
                >
                    All Quiz
                </button>
                <button className={`${baseButtonClass} ${buttonIndex === 1 ? selectedButtonClass : nonSelectedButtonClass
                    }`}
                    onClick={() => setButtonIndex(1)}
                >
                    Past
                </button>
                <button className={`${baseButtonClass} ${buttonIndex === 2 ? selectedButtonClass : nonSelectedButtonClass
                    }`}
                    onClick={() => setButtonIndex(2)}
                >
                    Upcoming
                </button>
                <button className={`${baseButtonClass} ${buttonIndex === 3 ? selectedButtonClass : nonSelectedButtonClass
                    }`}
                    onClick={() => setButtonIndex(3)}
                >
                    Ongoing
                </button>
                <button className={`${ready && !loggedIn ? "disabledButton" : ""} ${baseButtonClass} ${buttonIndex === 4 ? selectedButtonClass : nonSelectedButtonClass
                    }`}
                    onClick={handleNewQuiz}
                >
                    <div className='flex flex-col'>
                        <div className='flex justify-center'>
                            <BiBookAdd />
                        </div>
                        <div >New</div>
                    </div>
                </button>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5 text-wrap'>
                {quizes && quizes.filter(HandleFilterCondition).map((quiz) => (
                    <Link to={`/quiz/id/${parseInt(quiz.id)}`}>
                        <div key={quiz.id} className="mx-2 bg-gray-200 dark:bg-gray-800 rounded-lg shadow-md py-5 px-10 md:p-6 hover:shadow-lg hover:bg-gray-300
             dark:hover:bg-gray-700 transition duration-300 min-w-72 md:min-w-80  min-h-36">
                            <div className='flex flex-col gap-5'>
                                <div className='underline underline-offset-4 text-lg font-semibold flex justify-center -mt-4  '>{quiz.title}</div>
                                {/* <div>author ✍🏼 {quiz.createdBy}</div> */}
                                {/* <div>{quiz.startTime}</div> */}
                                <div className='flex  justify-between gap-1 md:gap-2'>
                                    <div className='flex justify-between'>
                                        <span className='text-xl sm:text-3xl'>📅</span> <span className='mt-1'>{moment(quiz.startTime).format('DD MMMM YY')}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-xl sm:text-3xl '>🕗</span> <span className='text-center mt-1'>{moment(quiz.startTime).format('HH:mm:ss')} IST</span></div>
                                </div>
                                <div className='flex justify-between gap-5'>
                                    <div>Duration</div>
                                    <div>
                                        {(() => {
                                            const days = moment(quiz.endTime).diff(moment(quiz.startTime), 'days');
                                            const hours = moment(quiz.endTime).diff(moment(quiz.startTime), 'hours') % 24;
                                            const minutes = moment(quiz.endTime).diff(moment(quiz.startTime), 'minutes') % 60;
                                            const seconds = moment(quiz.endTime).diff(moment(quiz.startTime), 'seconds') % 60;

                                            return `${days ? days + " Days " : ""}${hours ? hours + " Hours " : ""}${minutes ? minutes + " Minutes " : ""}${seconds ? seconds + " Seconds" : ""}`;
                                        })()}
                                    </div>

                                </div>

                            </div>
                        </div>
                    </Link>
                ))}

            </div>
        </div>
    )
}

export default MyQuizes;